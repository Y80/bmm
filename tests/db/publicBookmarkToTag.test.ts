import { fullSetBookmarkToTag } from '@/controllers/PublicBookmark.controller'
import { db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { eq, inArray } from 'drizzle-orm'
import { afterAll, describe, expect, test } from 'vitest'
import { batchCreateTags } from './utils'

const { publicBookmarkToTag, publicBookmarks, publicTags } = schema

describe('publicBookmarkToTag CRUD', async () => {
  const [bookmark] = await db
    .insert(publicBookmarks)
    .values({
      name: faker.word.noun(),
      url: faker.internet.url(),
    })
    .returning()

  const tags = await batchCreateTags(3)
  const tagIds = tags.map((e) => e.id)

  afterAll(async () => {
    await db.delete(publicBookmarks).where(eq(publicBookmarks.id, bookmark.id))
    await db.delete(publicTags).where(inArray(publicTags.id, tagIds))
  })

  test('CREATE', async () => {
    const relations: (typeof publicBookmarkToTag.$inferInsert)[] = tagIds.map((tId) => ({
      tId,
      bId: bookmark.id,
    }))
    const res = await db.insert(publicBookmarkToTag).values(relations).returning()
    expect(res.length).toBe(tagIds.length)
  })

  test('READ', async () => {
    const rows = await db.query.publicBookmarkToTag.findMany({
      where: eq(publicBookmarkToTag.bId, bookmark.id),
    })
    expect(rows.length).toBe(rows.length)
  })

  test('READ', async () => {
    const row = await db.query.publicBookmarks.findFirst({
      where: eq(publicBookmarks.id, bookmark.id),
      with: { relatedTagIds: true },
    })
    console.log(row)
    expect(row?.relatedTagIds.map((e) => e.tId)).toEqual(tagIds)
    expect(tagIds).toEqual(row?.relatedTagIds.map((e) => e.tId))
  })

  test('UPDATE', async () => {
    const [newTag] = await batchCreateTags(1)
    await fullSetBookmarkToTag(bookmark.id, [newTag.id])
    const rows = await db.query.publicBookmarkToTag.findMany({
      where: eq(publicBookmarkToTag.bId, bookmark.id),
    })
    expect(rows.length).toBe(1)
    expect(rows[0].tId).toBe(newTag.id)
    await db.delete(publicTags).where(eq(publicTags.id, newTag.id))
  })

  test('DELETE', async () => {
    // 表定义 Schema 中定义了 onDelete: cascade，因此删除 bookmark 时，相关连接也应该被删除
    await db.delete(publicBookmarks).where(eq(publicBookmarks.id, bookmark.id))
    const row = await db.query.publicBookmarkToTag.findFirst({
      where: eq(publicBookmarkToTag.bId, bookmark.id),
    })
    expect(row).toBeUndefined()
  })
})
