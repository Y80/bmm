/**
 *
 * 当前项目数据库支持 Sqlite、Postgres
 *
 * MySQL 也可接入，可根据 ./postgres 或 ./sqlite 下的代码自行创建 driver 和 schema
 *
 * schema 为数据库 DDL 的映射
 *
 * db 为操作数据库使用的 drizzle 实例，实例化代码位于 ./x/drivers 目录下
 *
 * 参考文档：https://orm.drizzle.team/docs/get-started-postgresql
 */

// import { db } from './mysql/drivers/mysql'
import { db as pgDb } from './postgres/drivers/postgres'
import { db as sqliteDb } from './sqlite/drivers/libsql'

const db = (process.env.DB_DRIVER === 'sqlite' ? sqliteDb : pgDb) as DB_DRIVER extends 'sqlite'
  ? typeof sqliteDb
  : typeof pgDb
const schema = db._.fullSchema

export { db, schema }
