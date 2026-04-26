import { FieldConstraints } from '@cfg'
import { integer, jsonb, pgTable, serial, timestamp, unique, varchar } from 'drizzle-orm/pg-core'
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
export const siteConfigs = pgTable(
  'siteConfigs',
  {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: FieldConstraints.MaxLen.DEFAULT }).notNull(),
    value: jsonb('value').$type<ConfigValue>().notNull(),
    version: integer('version').notNull().default(1),
    description: varchar('description', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [unique().on(table.key)]
)

/**
 * 用户配置表
 */
export const userConfigs = pgTable(
  'userConfigs',
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: FieldConstraints.MaxLen.DEFAULT }).notNull(),
    value: jsonb('value').$type<ConfigValue>().notNull(),
    version: integer('version').notNull().default(1),
    description: varchar('description', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.key)]
)
