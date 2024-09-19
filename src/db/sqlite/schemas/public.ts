import { relations } from 'drizzle-orm'
import { alias, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export type InsertPublicTag = typeof publicTags.$inferInsert

export type SelectPublicTag = typeof publicTags.$inferSelect

// export type EntityTag = SelectPublicTag & { relatedTagIds: SelectPublicTag['id'][] }

export const publicTags = sqliteTable('publicTags', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  color: text('color'),
  isMain: integer('isMain', { mode: 'boolean' }),
  pinyin: text('pinyin').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
// 通过 relations() 让 TS 知道 publicTags 还有个 'relatedTags' 字段
export const publicTagRelations = relations(publicTags, (ctx) => ({
  relatedTagIds: ctx.many(publicTagToTag),
  relatedBookmarkIds: ctx.many(publicBookmarkToTag),
}))

/**
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
  (table) => {
    return { pk: primaryKey({ columns: [table.a, table.b] }) }
  }
)

export const publicTagToTagRelations = relations(publicTagToTag, (ctx) => {
  // 表别名在自连接的场景中很重要
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

export const publicBookmarks = sqliteTable('publicBookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  url: text('url').unique().notNull(),
  icon: text('icon'),
  pinyin: text('pinyin'),
  description: text('description'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
export const publicBookmarkRelations = relations(publicBookmarks, (ctx) => ({
  relatedTagIds: ctx.many(publicBookmarkToTag),
}))

/**
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
  (table) => {
    return { pk: primaryKey({ columns: [table.bId, table.tId] }) }
  }
)

export const publicBookmarkToTagRelations = relations(publicBookmarkToTag, (ctx) => {
  return {
    bookmark: ctx.one(publicBookmarks, {
      fields: [publicBookmarkToTag.bId],
      references: [publicBookmarks.id],
    }),
    tag: ctx.one(publicTags, {
      fields: [publicBookmarkToTag.tId],
      references: [publicTags.id],
    }),
  }
})
