import { db, schema } from '@/db'
import { count as sqlCount } from 'drizzle-orm'

namespace UserController {
  export async function count() {
    const res = await db.select({ count: sqlCount() }).from(schema.users)
    return res[0].count
  }
}

export default UserController
