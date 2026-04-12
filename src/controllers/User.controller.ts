import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

const UserController = {
  async count() {
    return await db.$count(schema.users)
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
