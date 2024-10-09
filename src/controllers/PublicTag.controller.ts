import { db, publicTagToTag, publicTags } from '@/db'
import { isServerless } from '@/utils'
import { and, desc, eq, inArray, notInArray, or } from 'drizzle-orm'

export type { SelectTag as SelectPublicTag }

interface TagIdsExt {
  relatedTagIds: (typeof publicTags.$inferSelect)['id'][]
}

type SelectTag = TagIdsExt & typeof publicTags.$inferSelect

type InsertTag = Partial<TagOnlyIdRequired> & Pick<SelectTag, 'name'>

type TagOnlyIdRequired = Partial<Omit<SelectTag, 'id'>> & Pick<SelectTag, 'id'>

async function upsertTagToTagRelations(id: SelectTag['id'], tagIds: SelectTag['id'][]) {
  const tasks = [
    db
      .insert(publicTagToTag)
      .values(tagIds.map((relatedTagId) => ({ a: id, b: relatedTagId })))
      .onConflictDoNothing(),
    db
      .delete(publicTagToTag)
      .where(and(eq(publicTagToTag.a, id), notInArray(publicTagToTag.b, tagIds))),
  ]
  await Promise.all(tasks)
  return
}

module PublicTagController {
  let cachedAllTags: null | SelectTag[] = null
  export async function getAll() {
    // serverless 环境总是获取最新的数据
    if (isServerless() || !cachedAllTags) {
      const tags = await db.query.publicTags.findMany({
        with: { relatedTagIds: { columns: { b: true } } },
        orderBy: [desc(publicTags.sortOrder), desc(publicTags.createdAt)],
      })
      cachedAllTags = tags.map((tag) => ({
        ...tag,
        relatedTagIds: tag.relatedTagIds.map((el) => el.b),
      }))
    }
    return cachedAllTags
  }

  export async function insert(tag: InsertTag) {
    cachedAllTags = null
    const { relatedTagIds, ...resetTag } = tag
    const rows = await db.insert(publicTags).values(resetTag).returning()
    if (relatedTagIds?.length) {
      const id = rows[0].id
      const relations = relatedTagIds
        .map((b) => ({ b, a: id }))
        .map((el) => [el, { a: el.b, b: el.a }])
        .flat()
      await db.insert(publicTagToTag).values(relations)
    }
    return rows[0]
  }

  export async function update(tag: TagOnlyIdRequired) {
    cachedAllTags = null
    const { id, relatedTagIds, ...resetTag } = tag
    const tasks = []
    if (Object.keys(resetTag).length) {
      tasks.push(
        db
          .update(publicTags)
          .set({
            ...resetTag,
            updatedAt: new Date(),
          })
          .where(eq(publicTags.id, id))
      )
    }
    await Promise.all(tasks)
    if (relatedTagIds?.length) {
      const relations = relatedTagIds
        .map((b) => ({ b, a: id }))
        .map((el) => [el, { a: el.b, b: el.a }])
        .flat()
      await Promise.all([
        db.insert(publicTagToTag).values(relations).onConflictDoNothing(),
        db
          .delete(publicTagToTag)
          .where(
            or(
              and(eq(publicTagToTag.a, id), notInArray(publicTagToTag.b, relatedTagIds)),
              and(eq(publicTagToTag.b, id), notInArray(publicTagToTag.a, relatedTagIds))
            )
          ),
      ])
    }
  }

  export async function remove(tag: TagOnlyIdRequired) {
    cachedAllTags = null
    const res = await db.delete(publicTags).where(eq(publicTags.id, tag.id)).returning()
    return res
  }

  /** 获取所有标签的名称 */
  export async function getAllNames() {
    return (await getAll()).map(({ name }) => name)
  }

  export async function updateSortOrders(orders: { id: number; order: number }[]) {
    const tasks = orders.map((el) => {
      return db.update(publicTags).set({ sortOrder: el.order }).where(eq(publicTags.id, el.id))
    })
    await Promise.all(tasks)
  }

  /** 根据标签名称列表，尝试创建每个标签，并返回每个标签的 id */
  export async function tryCreateTags(names: string[]) {
    const res = await db
      .insert(publicTags)
      .values(names.map((name) => ({ name })))
      .returning()
      .onConflictDoNothing()
    if (res.length === names.length) return res
    // 有些标签已经创建过了，执行查询
    const existsNames = names.filter((name) => !res.some((tag) => tag.name === name))
    const existsTags = await db.query.publicTags.findMany({
      where: inArray(publicTags.name, existsNames),
    })
    return res.concat(existsTags)
  }
}

export default PublicTagController
