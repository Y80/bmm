import { SelectPublicTag, db, schema } from '@/db'
import { and, eq, inArray, notInArray } from 'drizzle-orm'
import { afterAll, assert, beforeAll, describe, expect, test } from 'vitest'
import { batchCreateTags } from './utils'

const { publicTagToTag, publicTags } = schema

describe('publicTagToTag CRUD', () => {
  let tags: SelectPublicTag[] = []

  beforeAll(async () => {
    tags = await batchCreateTags()
    console.log(tags.map((item) => item.id))
  })

  afterAll(async () => {
    await db.delete(publicTags).where(
      inArray(
        publicTags.id,
        tags.map((t) => t.id)
      )
    )
  })

  test('CREATE', async () => {
    const values = []
    const id1 = tags[0].id
    for (const tag of tags) {
      if (tag.id === id1) continue
      values.push({ a: id1, b: tag.id })
    }
    const res = await db.insert(publicTagToTag).values(values).returning()
    console.log({ res })
    expect(res.length).toBe(tags.length - 1)
  })

  test('READ', async () => {
    const row = await db.query.publicTags.findFirst({
      where: eq(publicTags.id, tags[0].id),
      with: { relatedTagIds: { columns: { b: true } } },
    })
    console.log(row)
    assert.lengthOf(row!.relatedTagIds, tags.length - 1)
  })

  test('UPDATE', async () => {
    const [{ id: id1 }, { id: id2 }] = await batchCreateTags(2)
    const newTagIds = [id1, id2]
    await Promise.all([
      db
        .insert(publicTagToTag)
        .values(newTagIds.map((id) => ({ a: tags[0].id, b: id })))
        .onConflictDoNothing(),
      db
        .delete(publicTagToTag)
        .where(and(eq(publicTagToTag.a, tags[0].id), notInArray(publicTagToTag.b, newTagIds))),
    ])
    const res = await db.query.publicTags.findFirst({
      where: eq(publicTags.id, tags[0].id),
      with: { relatedTagIds: { columns: { b: true } } },
    })
    assert.equal(res?.relatedTagIds?.length, 2)
    await db.delete(publicTags).where(inArray(publicTags.id, newTagIds))
  })

  test('DELETE', async () => {
    await db.delete(publicTagToTag).where(eq(publicTagToTag.a, tags[0].id))
    const res = await db.query.publicTags.findFirst({
      where: eq(publicTags.id, tags[0].id),
      with: { relatedTagIds: { columns: { b: true } } },
    })
    assert.equal(res?.relatedTagIds?.length, 0)
  })
})
