import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../schemas'

export const db = drizzle({
  // libSQL 会立即连接数据库，当 DB_DRIVER != 'sqlite' 时，使用 DB_CONNECTION_URL 连接可能报错，如 'postgres://xxx'
  // 这里使用 ':memory:' 规避这一可能的报错
  connection: process.env.DB_DRIVER !== 'sqlite' ? ':memory:' : process.env.DB_CONNECTION_URL,
  schema,
})
