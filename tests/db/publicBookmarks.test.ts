import { InsertPublicBookmark, db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { count, eq } from 'drizzle-orm'
import { describe, expect, test } from 'vitest'

const { publicBookmarks } = schema

describe('publicBookmarks: CRUD', () => {
  const mockBookmark: InsertPublicBookmark = {
    name: faker.word.noun(),
    url: faker.internet.url(),
  }

  let id = 0

  test('CREATE', async () => {
    const rows = await db.insert(publicBookmarks).values(mockBookmark).returning()
    console.log(rows[0])
    expect(rows[0]).toMatchObject(mockBookmark)
    id = rows[0].id
  })

  test('READ', async () => {
    const row = await db.query.publicBookmarks.findFirst({ where: eq(publicBookmarks.id, id) })
    expect(row).toMatchObject(mockBookmark)
  })

  test('UPDATE', async () => {
    const newName = faker.word.noun()
    const rows = await db
      .update(publicBookmarks)
      .set({ name: newName })
      .where(eq(publicBookmarks.id, id))
      .returning()
    expect(rows[0].name).toBe(newName)
  })

  test('DELETE', async () => {
    await db.delete(publicBookmarks).where(eq(publicBookmarks.id, id)).returning()
    const rows = await db
      .select({ count: count() })
      .from(publicBookmarks)
      .where(eq(publicBookmarks.id, id))
    expect(rows[0].count).toBe(0)
  })
})
