import { FieldConstraints } from '@cfg'
import { relations } from 'drizzle-orm'
import { alias, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { users } from './auth'

/**
 * 用户标签表
 */
export const userTags = sqliteTable(
  'userTags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name', { length: FieldConstraints.MaxLen.TAG_NAME }).notNull(),
    icon: text('icon'),
    color: text('color'),
    isMain: integer('isMain', { mode: 'boolean' }),
    pinyin: text('pinyin').default(''),
    sortOrder: integer('sortOrder').notNull().default(0),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.name, table.userId)]
)

/**
 * 标签之间的关系表
 * Tag : Tag = M : N
 */
export const userTagToTag = sqliteTable(
  'userTagToTag',
  {
    a: integer('a')
      .notNull()
      .references(() => userTags.id, { onDelete: 'cascade' }),
    b: integer('b')
      .notNull()
      .references(() => userTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.a, table.b] })]
)

/**
 * 用户书签表
 */
export const userBookmarks = sqliteTable(
  'userBookmarks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name', { length: FieldConstraints.MaxLen.BOOKMARK_NAME }).notNull(),
    url: text('url').notNull(),
    icon: text('icon'),
    pinyin: text('pinyin'),
    description: text('description', { length: FieldConstraints.MaxLen.BOOKMARK_DESC }),
    isPinned: integer('isPinned', { mode: 'boolean' }),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.url, table.userId), unique().on(table.name, table.userId)]
)

/**
 * 书签与标签的关系表
 * Bookmark : Tag = M : N
 */
export const userBookmarkToTag = sqliteTable(
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
