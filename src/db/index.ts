/**
 * 当前项目数据库支持 Sqlite、MySql、Postgres
 *
 * schema 为数据库 DDL 的映射，根据数据库 3 选 1 即可
 *
 * db 为操作数据库使用的 drizzle 实例，实例化代码位于 ./x/drivers 目录下
 * 可以根据实际情况添加新的 driver
 *
 * 参考文档：https://orm.drizzle.team/docs/get-started-postgresql
 */

// import { db } from './mysql/drivers/mysql2'
import { db as pgDb } from './postgres/drivers/postgres'
import { db as sqliteDb } from './sqlite/drivers/libsql'

const db = (process.env.DB_DRIVER === 'sqlite' ? sqliteDb : pgDb) as DB_DRIVER extends 'sqlite'
  ? typeof sqliteDb
  : typeof pgDb
const schema = db._.fullSchema

export { db, schema }

export type InsertPublicTag = typeof schema.publicTags.$inferInsert
export type SelectPublicTag = typeof schema.publicTags.$inferSelect
export type InsertPublicBookmark = typeof schema.publicBookmarks.$inferInsert
export type SelectPublicBookmark = typeof schema.publicBookmarks.$inferSelect
