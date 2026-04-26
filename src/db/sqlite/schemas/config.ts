import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { users } from './auth'

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue }

/**
 * 网站配置表
 */
export const siteConfigs = sqliteTable(
  'siteConfigs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    key: text('key').notNull(),
    value: text('value', { mode: 'json' }).$type<ConfigValue>().notNull(),
    version: integer('version').notNull().default(1),
    description: text('description'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [unique().on(table.key)]
)

/**
 * 用户配置表
 */
export const userConfigs = sqliteTable(
  'userConfigs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: text('value', { mode: 'json' }).$type<ConfigValue>().notNull(),
    version: integer('version').notNull().default(1),
    description: text('description'),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.key)]
)
