import { db, schema } from '@/db'
import { z } from '@/lib/zod'
import { asc, count, desc, eq, inArray, or } from 'drizzle-orm'
import { createUserFilterByKeyword } from './common'
import { findManyUsersSchema } from './schemas'

export type SelectUser = typeof schema.users.$inferSelect

const UserController = {
  async count() {
    return await db.$count(schema.users)
  },
  async findMany(query?: z.output<typeof findManyUsersSchema>) {
    query ||= findManyUsersSchema.parse({})
    const { keyword, page, limit, sorterKey } = query
    const filters = keyword ? createUserFilterByKeyword(schema.users, keyword) : undefined

    const [list, [{ total }]] = await Promise.all([
      db.query.users.findMany({
        where: filters,
        limit,
        offset: (page - 1) * limit,
        orderBy: [
          asc(schema.users.role),
          sorterKey.startsWith('-')
            ? desc(schema.users.createdAt)
            : asc(schema.users.createdAt),
        ],
      }),
      db.select({ total: count() }).from(schema.users).where(filters),
    ])

    return {
      total,
      hasMore: total > page * limit,
      list,
    }
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
    const { users, accounts, sessions, authenticators, credentials } = schema
    const { userBookmarks, userBookmarkToTag, userTags, userTagToTag } = schema

    const user = await db.transaction(async (tx) => {
      const [targetUser] = await tx.select().from(users).where(eq(users.id, userId)).limit(1)

      if (!targetUser) {
        throw new Error('用户不存在')
      }

      const [bookmarkRows, tagRows] = await Promise.all([
        tx.select({ id: userBookmarks.id }).from(userBookmarks).where(eq(userBookmarks.userId, userId)),
        tx.select({ id: userTags.id }).from(userTags).where(eq(userTags.userId, userId)),
      ])

      const bookmarkIds = bookmarkRows.map((row) => row.id)
      const tagIds = tagRows.map((row) => row.id)

      if (bookmarkIds.length > 0) {
        await tx.delete(userBookmarkToTag).where(inArray(userBookmarkToTag.bId, bookmarkIds))
      }

      if (tagIds.length > 0) {
        await tx.delete(userBookmarkToTag).where(inArray(userBookmarkToTag.tId, tagIds))
        await tx
          .delete(userTagToTag)
          .where(or(inArray(userTagToTag.a, tagIds), inArray(userTagToTag.b, tagIds)))
      }

      await tx.delete(userBookmarks).where(eq(userBookmarks.userId, userId))
      await tx.delete(userTags).where(eq(userTags.userId, userId))
      await tx.delete(accounts).where(eq(accounts.userId, userId))
      await tx.delete(sessions).where(eq(sessions.userId, userId))
      await tx.delete(authenticators).where(eq(authenticators.userId, userId))
      await tx.delete(credentials).where(eq(credentials.userId, userId))

      const [deletedUser] = await tx.delete(users).where(eq(users.id, userId)).returning()
      return deletedUser
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    return user
  },
}

export default UserController
