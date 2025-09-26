import { db, schema } from '@/db'

const UserController = {
  async count() {
    return await db.$count(schema.users)
  },
}

export default UserController
