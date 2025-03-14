import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { z } from '@/lib/zod'
import { getPinyin } from '@/utils'
import { DEFAULT_BOOKMARK_PAGESIZE } from '@cfg'
import { and, asc, count, desc, eq, ilike, inArray, notInArray, or, sql } from 'drizzle-orm'
import { findManyBookmarksSchema } from './schemas'

const { publicBookmarkToTag, userBookmarks } = schema

interface TagIdsExt {
  relatedTagIds: TagId[]
}
export type InsertPublicBookmark = Partial<TagIdsExt> & typeof userBookmarks.$inferInsert
type SelectBookmark = TagIdsExt & typeof userBookmarks.$inferSelect
export type { SelectBookmark as SelectPublicBookmark }

/**
 * 完全更新 PublicBookmarkToTag 表，使与 bId 关联关联的 tId 全是 tagIds 中的 id
 */
export async function fullSetBookmarkToTag(bId: BookmarkId, tagIds: TagId[]) {
  const task = [
    db
      .insert(publicBookmarkToTag)
      .values(tagIds.map((tId) => ({ bId: bId, tId })))
      .onConflictDoNothing(),
    db
      .delete(publicBookmarkToTag)
      .where(and(eq(publicBookmarkToTag.bId, bId), notInArray(publicBookmarkToTag.tId, tagIds))),
  ]
  await Promise.all(task)
  return
}

function createBookmarkFilterByKeyword(kw: string) {
  return or(
    ilike(userBookmarks.name, `%${kw}%`),
    ilike(userBookmarks.pinyin, `%${kw}%`),
    ilike(userBookmarks.url, `%${kw}%`),
    ilike(userBookmarks.description, `%${kw}%`)
  )
}

function modifyUserTagLimiter(userId: UserId, bookmarkId: BookmarkId) {
  return and(eq(userBookmarks.id, bookmarkId), eq(userBookmarks.userId, userId))
}

const UserBookmarkController = {
  async insert(bookmark: InsertPublicBookmark) {
    const { relatedTagIds, ...resetBookmark } = bookmark
    resetBookmark.pinyin ||= getPinyin(resetBookmark.name)
    const rows = await db.insert(userBookmarks).values(resetBookmark).returning()
    const id = rows[0].id
    if (relatedTagIds?.length) {
      await fullSetBookmarkToTag(id, relatedTagIds)
    }
    return rows[0]
  },
  async query(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db.query.publicBookmarks.findFirst({
      where: eq(userBookmarks.id, bookmark.id),
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
    if (relatedTagIds?.length) {
      tasks.push(fullSetBookmarkToTag(id, relatedTagIds))
    }
    if (Object.keys(resetBookmark).length) {
      tasks.push(
        db
          .update(userBookmarks)
          .set({
            ...resetBookmark,
            updatedAt: new Date(),
            pinyin: resetBookmark.name ? getPinyin(resetBookmark.name) : undefined,
          })
          .where(eq(userBookmarks.id, id))
          .returning()
          .then((res) => res[0])
      )
    }
    const res = await Promise.all(tasks)
    return res.pop()
  },
  async delete(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db.delete(userBookmarks).where(eq(userBookmarks.id, bookmark.id)).returning()
    return res
  },
  /**
   * 高级搜索书签列表
   */
  async findMany(query: z.output<typeof findManyBookmarksSchema>) {
    const { keyword, tagIds, page, limit, sorterKey } = query

    const filters = (() => {
      const filters = []
      if (keyword) {
        filters.push(createBookmarkFilterByKeyword(keyword))
      }
      if (tagIds?.length) {
        const findTargetBIds = db
          .select({ bId: publicBookmarkToTag.bId })
          .from(publicBookmarkToTag)
          .where(inArray(publicBookmarkToTag.tId, tagIds))
          .groupBy(publicBookmarkToTag.bId)
          .having(sql`COUNT(DISTINCT ${publicBookmarkToTag.tId}) = ${tagIds.length}`)
        filters.push(inArray(userBookmarks.id, findTargetBIds))
      }
      return filters.length ? and(...filters) : undefined
    })()

    const [list, [{ total }]] = await Promise.all([
      await db.query.publicBookmarks.findMany({
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
      db.select({ total: count() }).from(userBookmarks).where(filters),
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
    const list = await db.query.publicBookmarks.findMany({
      with: { relatedTagIds: true },
      orderBy: sql`RANDOM()`,
      limit: DEFAULT_BOOKMARK_PAGESIZE,
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
    return await db.$count(userBookmarks, eq(userBookmarks.userId, userId))
  },
  /** 获取最近更新的 $DEFAULT_BOOKMARK_PAGESIZE 个书签 */
  async recent() {
    const res = await db.query.publicBookmarks.findMany({
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
    const res = await db.query.publicBookmarks.findMany({
      where: createBookmarkFilterByKeyword(keyword),
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
