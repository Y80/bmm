import { db, schema } from '@/db'
import { z } from '@/lib/zod'
import { asc, count, desc, eq } from 'drizzle-orm'
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
}

export default UserController
