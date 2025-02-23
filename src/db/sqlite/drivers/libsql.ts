import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../schemas'

export const db = drizzle({
  connection: { url: process.env.DB_CONNECTION_URL },
  schema,
})
