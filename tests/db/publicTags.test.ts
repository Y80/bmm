import { InsertPublicTag, db, publicTags } from '@/db'
import { faker } from '@faker-js/faker'
import { count, eq } from 'drizzle-orm'
import { describe, expect, test } from 'vitest'

describe('publicTags CRUD', async () => {
  const mockTag: InsertPublicTag = {
    name: faker.word.noun(),
    icon: 'tabler:search',
    color: faker.color.rgb(),
    isMain: Boolean(faker.number.int({ max: 1 })),
  }

  let newTagId = 0

  test('CREATE', async () => {
    const rows = await db.insert(publicTags).values(mockTag).returning()
    console.log({ rows })
    newTagId = rows[0].id
    expect(rows).length(1)
    expect(rows[0]).toMatchObject(mockTag)
  })

  test('READ', async () => {
    const rows = await db.select().from(publicTags).where(eq(publicTags.id, newTagId))
    expect(rows.length).toBe(1)
    expect(rows[0]).toMatchObject(mockTag)
  })

  test('UPDATE', async () => {
    const newName = mockTag.name + 'updated'
    const rows = await db
      .update(publicTags)
      .set({ name: newName })
      .where(eq(publicTags.id, newTagId))
      .returning()
    expect(rows).length(1)
    expect(rows[0].name).toBe(newName)
  })

  test('DELETE', async () => {
    await db.delete(publicTags).where(eq(publicTags.id, newTagId))
    const rows = await db
      .select({ count: count() })
      .from(publicTags)
      .where(eq(publicTags.id, newTagId))
    expect(rows[0].count).toBe(0)
  })
})

describe('Other Cases', () => {
  test('名称重复', async () => {
    const row = await db.query.publicTags.findFirst()
    expect(row).toBeTruthy()
    try {
      await db.insert(publicTags).values({ name: row?.name! })
    } catch (error) {
   
    }
    await db.delete(publicTags).where(eq(publicTags.id, row?.id!))
  })
})
