import { db, schema } from '@/db'
import { z } from '@/lib/zod'
import { and, asc, count, desc, eq, inArray, isNull, lt, notExists, or, sql } from 'drizzle-orm'
import { createUserFilterByKeyword } from './common'
import { findManyUsersSchema } from './schemas'

export type SelectUser = typeof schema.users.$inferSelect

const UserController = {
  async count() {
    return await db.$count(schema.users)
  },
  async findAll() {
    return await db.query.users.findMany({
      orderBy: [asc(schema.users.role), desc(schema.users.createdAt)],
    })
  },
  async findMany(query?: z.output<typeof findManyUsersSchema>) {
    query ||= findManyUsersSchema.parse({})
    const { keyword, page, limit, sorterKey } = query
    const { users } = schema
    const filters = keyword ? createUserFilterByKeyword(users, keyword) : undefined
    const order = sorterKey.startsWith('-') ? desc : asc
    const orderBy = sorterKey.endsWith('lastLoginTime')
      ? [sql`${users.lastLoginAt} is null`, order(users.lastLoginAt), asc(users.id)]
      : [asc(users.role), order(users.createdAt), asc(users.id)]

    const [list, [{ total }]] = await Promise.all([
      db.query.users.findMany({
        where: filters,
        limit,
        offset: (page - 1) * limit,
        orderBy,
      }),
      db.select({ total: count() }).from(users).where(filters),
    ])

    return {
      total,
      hasMore: total > page * limit,
      list,
    }
  },
  async recordLogin(userId: UserId, lastLoginAt = new Date()) {
    const { users } = schema
    await db
      .update(users)
      .set({ lastLoginAt })
      .where(
        and(eq(users.id, userId), or(isNull(users.lastLoginAt), lt(users.lastLoginAt, lastLoginAt)))
      )
  },
  async updateProfile(
    userId: UserId,
    payload: {
      name: string
      image: string | null
    }
  ) {
    const [user] = await db
      .update(schema.users)
      .set({
        name: payload.name,
        image: payload.image,
      })
      .where(eq(schema.users.id, userId))
      .returning()

    if (!user) {
      throw new Error('用户不存在')
    }

    return user
  },
  async delete(userId: UserId) {
    const { users, accounts, sessions, authenticators, credentials, verificationTokens } = schema
    const { userBookmarks, userBookmarkToTag, userTags, userTagToTag, userReadLaterItems, userConfigs } =
      schema

    return await db.transaction(async (tx) => {
      const bookmarkIds = tx
        .select({ id: userBookmarks.id })
        .from(userBookmarks)
        .where(eq(userBookmarks.userId, userId))
      const tagIds = tx.select({ id: userTags.id }).from(userTags).where(eq(userTags.userId, userId))
      await tx
        .delete(userBookmarkToTag)
        .where(or(inArray(userBookmarkToTag.bId, bookmarkIds), inArray(userBookmarkToTag.tId, tagIds)))
      await tx
        .delete(userTagToTag)
        .where(or(inArray(userTagToTag.a, tagIds), inArray(userTagToTag.b, tagIds)))

      await tx.delete(userBookmarks).where(eq(userBookmarks.userId, userId))
      await tx.delete(userTags).where(eq(userTags.userId, userId))
      await tx.delete(userReadLaterItems).where(eq(userReadLaterItems.userId, userId))
      await tx.delete(userConfigs).where(eq(userConfigs.userId, userId))
      await tx.delete(accounts).where(eq(accounts.userId, userId))
      await tx.delete(sessions).where(eq(sessions.userId, userId))
      await tx.delete(authenticators).where(eq(authenticators.userId, userId))
      await tx.delete(credentials).where(eq(credentials.userId, userId))

      const [deletedUser] = await tx.delete(users).where(eq(users.id, userId)).returning()
      if (!deletedUser) throw new Error('用户不存在')

      await tx.delete(verificationTokens).where(
        and(
          eq(verificationTokens.identifier, deletedUser.email),
          notExists(tx.select({ id: users.id }).from(users).where(eq(users.email, deletedUser.email)))
        )
      )
      return deletedUser
    })
  },
}

export default UserController
