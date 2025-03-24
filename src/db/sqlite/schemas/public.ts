import { relations } from 'drizzle-orm'
import { alias, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * 公共标签表
 */
export const publicTags = sqliteTable('publicTags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  color: text('color'),
  pinyin: text('pinyin'),
  isMain: integer('isMain', { mode: 'boolean' }),
  sortOrder: integer('sortOrder').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

/**
 * 标签之间的关系表
 * Tag : Tag = M : N
 */
export const publicTagToTag = sqliteTable(
  'publicTagToTag',
  {
    a: integer('a')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
    b: integer('b')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.a, table.b] })]
)

/**
 * 公共书签表
 */
export const publicBookmarks = sqliteTable('publicBookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  url: text('url').unique().notNull(),
  icon: text('icon'),
  pinyin: text('pinyin'),
  description: text('description'),
  isPinned: integer('isPinned', { mode: 'boolean' }),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

/**
 * 书签与标签的关系表
 * Bookmark : Tag = M : N
 */
export const publicBookmarkToTag = sqliteTable(
  'publicBookmarkToTag',
  {
    bId: integer('bId')
      .notNull()
      .references(() => publicBookmarks.id, { onDelete: 'cascade' }),
    tId: integer('tId')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.bId, table.tId] })]
)

// relations() 不会创建数据表，只是用于类型推断

export const publicTagRelations = relations(publicTags, (ctx) => ({
  relatedTagIds: ctx.many(publicTagToTag),
  relatedBookmarkIds: ctx.many(publicBookmarkToTag),
}))

export const publicTagToTagRelations = relations(publicTagToTag, (ctx) => {
  const aliasPublicTags = alias(publicTags, 'aliasPublicTags')
  return {
    tagA: ctx.one(publicTags, {
      fields: [publicTagToTag.a],
      references: [publicTags.id],
    }),
    tagB: ctx.one(aliasPublicTags, {
      fields: [publicTagToTag.b],
      references: [aliasPublicTags.id],
    }),
  }
})

export const publicBookmarkRelations = relations(publicBookmarks, (ctx) => ({
  relatedTagIds: ctx.many(publicBookmarkToTag),
}))

export const publicBookmarkToTagRelations = relations(publicBookmarkToTag, (ctx) => ({
  bookmark: ctx.one(publicBookmarks, {
    fields: [publicBookmarkToTag.bId],
    references: [publicBookmarks.id],
  }),
  tag: ctx.one(publicTags, {
    fields: [publicBookmarkToTag.tId],
    references: [publicTags.id],
  }),
}))
