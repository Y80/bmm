import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { z } from '@/lib/zod'
import { getPinyin } from '@/utils'
import { DEFAULT_BOOKMARK_PAGESIZE } from '@cfg'
import { and, asc, desc, eq, ilike, inArray, notInArray, or, sql } from 'drizzle-orm'
import { findManyBookmarksSchema } from './schemas'
import UserTagController from './UserTag.controller'

const { userBookmarkToTag, userBookmarks } = schema

interface TagIdsExt {
  relatedTagIds: TagId[]
}
type InsertBookmark = Partial<TagIdsExt> & Omit<typeof userBookmarks.$inferInsert, 'id' | 'userId'>
type SelectBookmark = TagIdsExt & typeof userBookmarks.$inferSelect
export type { SelectBookmark as SelectPublicBookmark }

/**
 * 完全更新 PublicBookmarkToTag 表，使与 bId 关联关联的 tId 全是 tagIds 中的 id
 */
async function fullSetBookmarkToTag(bId: BookmarkId, tagIds: TagId[]) {
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

function createBookmarkFilterByKeyword(kw: string) {
  return or(
    ilike(userBookmarks.name, `%${kw}%`),
    ilike(userBookmarks.pinyin, `%${kw}%`),
    ilike(userBookmarks.url, `%${kw}%`),
    ilike(userBookmarks.description, `%${kw}%`)
  )!
}

function modifyEntityLimiter(userId: UserId, bookmarkId: BookmarkId) {
  return and(eq(userBookmarks.id, bookmarkId), eq(userBookmarks.userId, userId))
}

const UserBookmarkController = {
  async insert(bookmark: InsertBookmark) {
    const { relatedTagIds, ...resetBookmark } = bookmark
    resetBookmark.pinyin ||= getPinyin(resetBookmark.name)
    const rows = await db
      .insert(userBookmarks)
      .values({ ...resetBookmark, userId: await getAuthedUserId() })
      .returning()
    if (relatedTagIds?.length) {
      await fullSetBookmarkToTag(rows[0].id, relatedTagIds)
    }
    return rows[0]
  },
  async query(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db.query.userBookmarks.findFirst({
      where: modifyEntityLimiter(await getAuthedUserId(), bookmark.id),
      with: { relatedTagIds: true },
    })
    if (!res) throw new Error('书签不存在')
    return {
      ...res,
      relatedTagIds: res.relatedTagIds.map((el) => el.tId),
    }
  },
  async update(bookmark: Partial<SelectBookmark> & Pick<SelectBookmark, 'id'>) {
    const { relatedTagIds, id, ...resetBookmark } = bookmark
    const tasks = []
    if (relatedTagIds) {
      tasks.push(fullSetBookmarkToTag(id, relatedTagIds))
    }
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
          .where(modifyEntityLimiter(await getAuthedUserId(), id))
          .returning()
      )
    }
    await Promise.all(tasks)
  },
  async delete(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db
      .delete(userBookmarks)
      .where(modifyEntityLimiter(await getAuthedUserId(), bookmark.id))
      .returning()
    return res
  },
  /**
   * 高级搜索书签列表
   */
  async findMany(query: z.output<typeof findManyBookmarksSchema>) {
    const { keyword, tagIds, page, limit, sorterKey } = query
    const userId = await getAuthedUserId()
    const filters = (() => {
      const filters = [eq(userBookmarks.userId, userId)]
      if (keyword) {
        filters.push(createBookmarkFilterByKeyword(keyword))
      }
      if (tagIds?.length) {
        const findTargetBIds = db
          .select({ bId: userBookmarkToTag.bId })
          .from(userBookmarkToTag)
          .where(inArray(userBookmarkToTag.tId, tagIds))
          .groupBy(userBookmarkToTag.bId)
          .having(sql`COUNT(DISTINCT ${userBookmarkToTag.tId}) = ${tagIds.length}`)
        filters.push(inArray(userBookmarks.id, findTargetBIds))
      }
      return and(...filters)
    })()

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
        createBookmarkFilterByKeyword(keyword),
        eq(userBookmarks.userId, await getAuthedUserId())
      ),
      with: { relatedTagIds: true },
      limit: 50,
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
