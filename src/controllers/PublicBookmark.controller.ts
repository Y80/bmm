import { db, publicBookmarkToTag, publicBookmarks, publicTags } from '@/db'
import { z } from '@/lib/zod'
import { getPinyin } from '@/utils'
import { and, asc, count, desc, eq, ilike, inArray, notInArray, or, sql } from 'drizzle-orm'
import { findManyBookmarksSchema } from './schemas'

export type { SelectBookmark as SelectPublicBookmark }

interface TagIdsExt {
  relatedTagIds: (typeof publicTags.$inferSelect)['id'][]
}

type SelectTag = TagIdsExt & typeof publicTags.$inferSelect

export type InsertPublicBookmark = Partial<TagIdsExt> & typeof publicBookmarks.$inferInsert

type SelectBookmark = TagIdsExt & typeof publicBookmarks.$inferSelect

/**
 * 完全更新 PublicBookmarkToTag 表，使与 bId 关联关联的 tId 全是 tagIds 中的 id
 */
export async function fullSetBookmarkToTag(bId: SelectBookmark['id'], tagIds: SelectTag['id'][]) {
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

const PublicBookmarkController = {
  async insert(bookmark: InsertPublicBookmark) {
    const { relatedTagIds, ...resetBookmark } = bookmark
    resetBookmark.pinyin ||= getPinyin(resetBookmark.name)
    const rows = await db.insert(publicBookmarks).values(resetBookmark).returning()
    const id = rows[0].id
    if (relatedTagIds?.length) {
      await fullSetBookmarkToTag(id, relatedTagIds)
    }
    return rows[0]
  },
  async query(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db.query.publicBookmarks.findFirst({
      where: eq(publicBookmarks.id, bookmark.id),
      with: { relatedTagIds: true },
    })
    if (res) {
      return {
        ...res,
        relatedTagIds: res.relatedTagIds.map((el) => el.tId),
      }
    }
    return res
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
          .update(publicBookmarks)
          .set({
            ...resetBookmark,
            updatedAt: new Date(),
            pinyin: resetBookmark.name ? getPinyin(resetBookmark.name) : undefined,
          })
          .where(eq(publicBookmarks.id, id))
          .returning()
          .then((res) => res[0])
      )
    }
    const res = await Promise.all(tasks)
    return res.pop()
  },
  async delete(bookmark: Pick<SelectBookmark, 'id'>) {
    const res = await db.delete(publicBookmarks).where(eq(publicBookmarks.id, bookmark.id))
    return res
  },
  /**
   * 高级搜索书签列表
   * - 有 tagIds 时，不分页；其他情况下都会走分页查询
   */
  async findMany(query: z.output<typeof findManyBookmarksSchema>) {
    const { keyword, tagIds, page, limit, sorterKey } = query

    const filters = (() => {
      const filters = []
      if (keyword) {
        filters.push(
          or(
            ilike(publicBookmarks.name, `%${keyword}%`),
            ilike(publicBookmarks.pinyin, `%${keyword}%`),
            ilike(publicBookmarks.url, `%${keyword}%`)
          )
        )
      }
      if (tagIds?.length) {
        const findTargetBIds = db
          .select({ bId: publicBookmarkToTag.bId })
          .from(publicBookmarkToTag)
          .where(inArray(publicBookmarkToTag.tId, tagIds))
          .groupBy(publicBookmarkToTag.bId)
          .having(sql`COUNT(DISTINCT ${publicBookmarkToTag.tId}) = ${tagIds.length}`)
        filters.push(inArray(publicBookmarks.id, findTargetBIds))
      }
      return filters.length ? and(...filters) : undefined
    })()

    const [res, [{ total }]] = await Promise.all([
      await db.query.publicBookmarks.findMany({
        where: filters,
        with: { relatedTagIds: true },
        ...(!tagIds?.length && {
          limit,
          offset: (page - 1) * limit,
        }),
        orderBy: (() => {
          const sort = sorterKey.startsWith('-') ? desc : asc
          const field = sorterKey.includes('update')
            ? publicBookmarks.updatedAt
            : sorterKey.includes('create')
              ? publicBookmarks.createdAt
              : null

          return field ? sort(field) : undefined
        })(),
      }),
      db.select({ total: count() }).from(publicBookmarks).where(filters),
    ])

    return {
      total,
      list: res.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
  async random() {
    // db.select().from(publicBookmarks).orderBy(sql`RANDOM()`).limit(1)
    const listTask = db.query.publicBookmarks.findMany({
      with: { relatedTagIds: true },
      orderBy: sql`RANDOM()`,
      limit: 24,
    })
    const countTask = db.select({ count: count() }).from(publicBookmarks)
    const [list, total] = await Promise.all([listTask, countTask])
    return {
      total: total[0].count,
      list: list.map((item) => ({
        ...item,
        relatedTagIds: item.relatedTagIds.map((el) => el.tId),
      })),
    }
  },
  /** 获取所有书签数量 */
  async total() {
    const res = await db.select({ count: count() }).from(publicBookmarks)
    return res[0].count
  },
  /** 获取最近更新的 20 个书签 */
  async recent() {
    const res = await db.query.publicBookmarks.findMany({
      orderBy(fields, op) {
        return op.desc(fields.updatedAt)
      },
      with: { relatedTagIds: true },
      limit: 20,
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
      where: or(
        ilike(publicBookmarks.name, `%${keyword}%`),
        ilike(publicBookmarks.pinyin, `%${keyword}%`),
        ilike(publicBookmarks.url, `%${keyword}%`)
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

export default PublicBookmarkController