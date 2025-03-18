import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { initGlobalData } from '@/utils/global-data'
import { and, desc, eq, inArray, notInArray, or } from 'drizzle-orm'

const { userTagToTag, userTags } = schema

/** 在 SelectTag 基础上扩展了 `{ relatedTagIds: id[] }` */
export type SelectUserTag = typeof userTags.$inferSelect & {
  relatedTagIds: TagId[]
}

const cachedTags = initGlobalData({
  key: 'userTags',
  initialData() {
    const cachedTags: Record<UserId, SelectUserTag[] | null> = {}
    return cachedTags
  },
})

function resetCachedTags(userId: UserId) {
  cachedTags[userId] = null
}

// 过滤出用户拥有的标签

async function upsertRelations(userId: UserId, id: TagId, ids?: TagId[]) {
  if (!ids) return
  ids = await UserTagController.filterUserTagIds(userId, ids)
  const relations = ids
    .map((_id) => [
      { a: id, b: _id },
      { b: id, a: _id },
    ])
    .flat()
  const tasks = [
    relations.length && db.insert(userTagToTag).values(relations).onConflictDoNothing(),
    db
      .delete(userTagToTag)
      .where(
        or(
          and(eq(userTagToTag.a, id), notInArray(userTagToTag.b, ids)),
          and(eq(userTagToTag.b, id), notInArray(userTagToTag.a, ids))
        )
      ),
  ]
  await Promise.all(tasks)
  resetCachedTags(userId)
}

function modifyUserTagLimiter(userId: UserId, tagId: TagId) {
  return and(eq(userTags.id, tagId), eq(userTags.userId, userId))
}

type InsertUserTag = Partial<SelectTag> & Pick<SelectTag, 'name'>
type UpdateUserTag = Partial<SelectTag> & Pick<SelectTag, 'id'>

const UserTagController = {
  async getAll(userId?: string) {
    userId ||= await getAuthedUserId()
    if (!cachedTags[userId]) {
      const tags = await db.query.userTags.findMany({
        where: eq(userTags.userId, userId),
        with: { relatedTagIds: { columns: { b: true } } },
        orderBy: [desc(userTags.sortOrder), desc(userTags.createdAt)],
      })
      cachedTags[userId] = tags.map((tag) => ({
        ...tag,
        relatedTagIds: tag.relatedTagIds.map((el) => el.b),
      }))
    }
    return cachedTags[userId]!
  },

  async insert(tag: InsertUserTag) {
    const userId = await getAuthedUserId()
    const { relatedTagIds, ...resetTag } = tag
    const rows = await db
      .insert(userTags)
      .values({ ...resetTag, userId })
      .returning()
    relatedTagIds?.length && (await upsertRelations(userId, rows[0].id, relatedTagIds))
    resetCachedTags(userId)
    return rows[0]
  },

  async update(tag: UpdateUserTag) {
    const userId = await getAuthedUserId()
    const { id, relatedTagIds, ...resetTag } = tag
    await db
      .update(userTags)
      .set({ ...resetTag, updatedAt: new Date() })
      .where(modifyUserTagLimiter(userId, id))
    await upsertRelations(userId, id, relatedTagIds)
  },

  async remove(tag: Pick<SelectUserTag, 'id'>) {
    const userId = await getAuthedUserId()
    const res = await db.delete(userTags).where(modifyUserTagLimiter(userId, tag.id)).returning()
    resetCachedTags(userId)
    return res
  },

  /** 获取所有标签的名称 */
  async getAllNames() {
    return (await this.getAll()).map(({ name }) => name)
  },

  async sort(orders: { id: TagId; order: SelectTag['sortOrder'] }[]) {
    const userId = await getAuthedUserId()
    const tasks = orders.map((el) => {
      return db
        .update(userTags)
        .set({ sortOrder: el.order })
        .where(modifyUserTagLimiter(userId, el.id))
    })
    await Promise.all(tasks)
    resetCachedTags(userId)
  },

  /** 根据标签名称列表，尝试创建每个标签，并返回每个标签的 id */
  async tryCreateTags(names: string[]) {
    const userId = await getAuthedUserId()
    resetCachedTags(userId)
    const res = await db
      .insert(userTags)
      .values(names.map((name) => ({ name, userId })))
      .returning()
      .onConflictDoNothing()
    if (res.length === names.length) return res
    // 有些标签已经创建过了，执行查询
    const existsNames = names.filter((name) => !res.some((tag) => tag.name === name))
    const existsTags = await db.query.userTags.findMany({
      where: and(inArray(userTags.name, existsNames), eq(userTags.userId, userId)),
    })
    return res.concat(existsTags)
  },

  async filterUserTagIds(userId: UserId, ids: TagId[]) {
    const tags = await UserTagController.getAll(userId)
    return ids.filter((id) => tags.some((tag) => tag.id === id))
  },
}

export default UserTagController
