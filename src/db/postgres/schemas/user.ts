import { FieldConstraints } from '@cfg'
import { relations } from 'drizzle-orm'
import {
  alias,
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './auth'

/**
 * 用户标签表
 */
export const userTags = pgTable(
  'userTags',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: FieldConstraints.MaxLen.TAG_NAME }).notNull(),
    icon: varchar('icon', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    color: varchar('color', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    pinyin: varchar('pinyin', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    isMain: boolean('isMain'),
    sortOrder: integer('sortOrder').notNull().default(0),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    userId: varchar('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.name, table.userId)]
)

/**
 * 标签之间的关系表
 * Tag : Tag = M : N
 */
export const userTagToTag = pgTable(
  'userTagToTag',
  {
    a: serial('a')
      .notNull()
      .references(() => userTags.id, { onDelete: 'cascade' }),
    b: serial('b')
      .notNull()
      .references(() => userTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.a, table.b] })]
)

/**
 * 用户书签表
 */
export const userBookmarks = pgTable(
  'userBookmarks',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: FieldConstraints.MaxLen.BOOKMARK_NAME }).notNull(),
    url: varchar('url', { length: FieldConstraints.MaxLen.URL }).notNull(),
    icon: varchar('icon', { length: FieldConstraints.MaxLen.DEFAULT }),
    pinyin: varchar('pinyin', { length: FieldConstraints.MaxLen.DEFAULT }),
    description: varchar('description', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    isPinned: boolean('isPinned'),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .$defaultFn(() => new Date()),
    userId: varchar('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.name, table.userId), unique().on(table.userId, table.url)]
)

/**
 * 书签与标签的关系表
 * Bookmark : Tag = M : N
 */
export const userBookmarkToTag = pgTable(
  'userBookmarkToTag',
  {
    bId: integer('bId')
      .notNull()
      .references(() => userBookmarks.id, { onDelete: 'cascade' }),
    tId: integer('tId')
      .notNull()
      .references(() => userTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.bId, table.tId] })]
)

// relations() 不会创建数据表，只是用于类型推断

export const userTagRelations = relations(userTags, (ctx) => ({
  relatedTagIds: ctx.many(userTagToTag),
  relatedBookmarkIds: ctx.many(userBookmarkToTag),
}))

export const userTagToTagRelations = relations(userTagToTag, (ctx) => {
  const aliasPublicTags = alias(userTags, 'aliasPublicTags')
  return {
    tagA: ctx.one(userTags, {
      fields: [userTagToTag.a],
      references: [userTags.id],
    }),
    tagB: ctx.one(aliasPublicTags, {
      fields: [userTagToTag.b],
      references: [aliasPublicTags.id],
    }),
  }
})

export const userBookmarkRelations = relations(userBookmarks, (ctx) => ({
  relatedTagIds: ctx.many(userBookmarkToTag),
}))

export const userBookmarkToTagRelations = relations(userBookmarkToTag, (ctx) => ({
  bookmark: ctx.one(userBookmarks, {
    fields: [userBookmarkToTag.bId],
    references: [userBookmarks.id],
  }),
  tag: ctx.one(userTags, {
    fields: [userBookmarkToTag.tId],
    references: [userTags.id],
  }),
}))
