/**
 * 数据库类型定义
 * 用于解决构建时的类型兼容性问题
 */

// 导入PostgreSQL和SQLite数据库实例类型
import type { db as PgDbType } from '@/db/postgres/drivers/postgres'
import type { db as SqliteDbType } from '@/db/sqlite/drivers/libsql'

// 导出数据库实例类型别名，用于解决构建时的类型推断问题
export type PostgresDrizzleDb = typeof PgDbType
export type SqliteDrizzleDb = typeof SqliteDbType

// 导出通用数据库类型
export type DrizzleDb = PostgresDrizzleDb | SqliteDrizzleDb
