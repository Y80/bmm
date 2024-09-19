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
// import * as schema from './mysql/schemas'

// import {db} from './sqlite/drivers/better-sqlite3'
// import * as schema from './sqlite/schemas'

import { db, pgSql } from './postgres/drivers/postgres'
import * as schema from './postgres/schemas'

export { db, pgSql, schema }

export const { publicBookmarks, publicTags, publicBookmarkToTag, publicTagToTag } = schema

export type InsertPublicTag = typeof schema.publicTags.$inferInsert
export type SelectPublicTag = typeof schema.publicTags.$inferSelect
export type InsertPublicBookmark = typeof schema.publicBookmarks.$inferInsert
export type SelectPublicBookmark = typeof schema.publicBookmarks.$inferSelect
