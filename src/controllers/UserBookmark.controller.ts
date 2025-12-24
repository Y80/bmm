import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { z } from '@/lib/zod'
import { getPinyin } from '@/utils'
import { DEFAULT_BOOKMARK_PAGESIZE } from '@cfg'
import { and, asc, desc, eq, inArray, notInArray, or, sql } from 'drizzle-orm'
import { createBookmarkFilterByKeyword } from './common'
import { findManyBookmarksSchema } from './schemas'
import UserTagController from './UserTag.controller'

const { userBookmarkToTag, userBookmarks } = schema

interface TagIdsExt {
  relatedTagIds: TagId[]
}
type InsertBookmark = Partial<TagIdsExt> & Omit<typeof userBookmarks.$inferInsert, 'id' | 'userId'>
type SelectUserBookmark = TagIdsExt & typeof userBookmarks.$inferSelect

/**
 * 完全更新 PublicBookmarkToTag 表，使与 bId 关联关联的 tId 全是 tagIds 中的 id
 */
async function fullSetBookmarkToTag(bId: BookmarkId, tagIds?: TagId[]) {
  if (!tagIds?.length) return
  const userId = await getAuthedUserId()
  tagIds = await UserTagController.filterUserTagIds(userId, tagIds)
  const task = [
    tagIds.length &&
      db
        .insert(userBookmarkToTag)
        .values(tagIds.map((tId) => ({ bId: bId, tId })))
        .onConflictDoNothing(),
    db
      .delete(userBookmarkToTag)
      .where(and(eq(userBookmarkToTag.bId, bId), notInArray(userBookmarkToTag.tId, tagIds))),
  ]
  await Promise.all(task)
}

function userLimiter(userId: UserId, bookmarkId?: BookmarkId) {
  if (!bookmarkId) return eq(userBookmarks.userId, userId)
  return and(eq(userBookmarks.id, bookmarkId), eq(userBookmarks.userId, userId))
}

const UserBookmarkController = {
  async insert(bookmark: InsertBookmark) {
    const userId = await getAuthedUserId()
    // 插入之前先检查当前用户是否有相同网址或名称的记录
    const count = await db.$count(
      userBookmarks,
      and(
        eq(userBookmarks.userId, userId),
        or(eq(userBookmarks.url, bookmark.url), eq(userBookmarks.name, bookmark.name))
      )
    )
    if (count > 0) throw new Error('已存在相同网址或名称的书签')
    bookmark.pinyin ||= getPinyin(bookmark.name)
    const rows = await db
      .insert(userBookmarks)
      .values({ ...bookmark, userId })
      .returning()
    await fullSetBookmarkToTag(rows[0].id, bookmark.relatedTagIds)
    return rows[0]
  },
  async query(bookmark: Pick<SelectUserBookmark, 'id'>) {
    const res = await db.query.userBookmarks.findFirst({
      where: userLimiter(await getAuthedUserId(), bookmark.id),
      with: { relatedTagIds: true },
    })
    if (!res) throw new Error('书签不存在')
    return {
      ...res,
      relatedTagIds: res.relatedTagIds.map((el) => el.tId),
    }
  },
  async update(bookmark: Partial<SelectUserBookmark> & Pick<SelectUserBookmark, 'id'>) {
    const { relatedTagIds, id, ...resetBookmark } = bookmark
    const tasks = []
    tasks.push(fullSetBookmarkToTag(id, relatedTagIds))
    if (Object.keys(resetBookmark).length) {
      if (resetBookmark.name && !resetBookmark.pinyin) {
        resetBookmark.pinyin = getPinyin(resetBookmark.name)
      }
      tasks.push(
        db
          .update(userBookmarks)
          .set({
            ...resetBookmark,
            updatedAt: new Date(),
          })
          .where(userLimiter(await getAuthedUserId(), id))
          .returning()
      )
    }
    await Promise.all(tasks)
  },
  async delete(bookmark: Pick<SelectUserBookmark, 'id'>) {
    const res = await db
      .delete(userBookmarks)
      .where(userLimiter(await getAuthedUserId(), bookmark.id))
      .returning()
    return res
  },
  /**
   * 高级搜索书签列表
   */
  async findMany(query?: z.output<typeof findManyBookmarksSchema>) {
    query ||= findManyBookmarksSchema.parse({})
    const { keyword, tagIds = [], tagNames, page, limit, sorterKey } = query
    const userId = await getAuthedUserId()
    const getFilters = async () => {
      const filters = [userLimiter(userId)]
      if (keyword) {
        filters.push(createBookmarkFilterByKeyword(userBookmarks, keyword))
      }
      if (tagNames?.length) {
        const tags = await UserTagController.getAll(userId)
        for (const name of tagNames) {
          const tag = tags.find((el) => el.name === name)
          tag && tagIds.push(tag.id)
        }
      }
      const newTagIds = await UserTagController.filterUserTagIds(userId, tagIds)
      if (newTagIds.length) {
        const findTargetBIds = db
          .select({ bId: userBookmarkToTag.bId })
          .from(userBookmarkToTag)
          .where(inArray(userBookmarkToTag.tId, newTagIds))
          .groupBy(userBookmarkToTag.bId)
          .having(sql`COUNT(DISTINCT ${userBookmarkToTag.tId}) = ${newTagIds.length}`)
        filters.push(inArray(userBookmarks.id, findTargetBIds))
      }
      return and(...filters)
    }
    const filters = await getFilters()
    const [total, list] = await Promise.all([
      db.$count(userBookmarks, filters),
      await db.query.userBookmarks.findMany({
        where: filters,
        with: { relatedTagIds: true },
        limit,
        offset: (page - 1) * limit,
        orderBy: (() => {
          const sort = sorterKey.startsWith('-') ? desc : asc
          const field = sorterKey.includes('update')
            ? userBookmarks.updatedAt
            : sorterKey.includes('create')
              ? userBookmarks.createdAt
              : null
          return field ? sort(field) : undefined
        })(),
      }),
    ])

    return {
      total,
      hasMore: total > page * limit,
      list: list.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
  async random() {
    const list = await db.query.userBookmarks.findMany({
      with: { relatedTagIds: true },
      orderBy: sql`RANDOM()`,
      limit: DEFAULT_BOOKMARK_PAGESIZE,
      where: eq(userBookmarks.userId, await getAuthedUserId()),
    })
    return {
      list: list.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
  /** 获取所有书签数量 */
  async total() {
    const userId = await getAuthedUserId()
    const filters = eq(userBookmarks.userId, userId)
    return await db.$count(userBookmarks, filters)
  },
  /** 获取最近更新的 $DEFAULT_BOOKMARK_PAGESIZE 个书签 */
  async recent() {
    const res = await db.query.userBookmarks.findMany({
      where: eq(userBookmarks.userId, await getAuthedUserId()),
      orderBy(fields, op) {
        return op.desc(fields.updatedAt)
      },
      with: { relatedTagIds: true },
      limit: DEFAULT_BOOKMARK_PAGESIZE,
    })
    return {
      list: res.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
  /** 根据关键词搜索书签 */
  async search(keyword: string) {
    const res = await db.query.userBookmarks.findMany({
      where: and(
        createBookmarkFilterByKeyword(userBookmarks, keyword),
        eq(userBookmarks.userId, await getAuthedUserId())
      ),
      with: { relatedTagIds: true },
      limit: 100,
    })
    return {
      list: res.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
}

export default UserBookmarkController
