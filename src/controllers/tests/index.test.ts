import { db, schema } from '@/db'
import { to } from '@/utils'
import { FieldConstraints } from '@cfg'
import { faker } from '@faker-js/faker'
import { count, eq, inArray } from 'drizzle-orm'
import { afterAll, assert, beforeAll, describe, test } from 'vitest'
import PublicBookmarkController from '../PublicBookmark.controller'
import PublicTagController from '../PublicTag.controller'

const { publicBookmarks, publicTags, publicBookmarkToTag, publicTagToTag } = schema

describe('G: PublicTagController', () => {
  let id = 0

  test('Insert a Tag', async () => {
    const row = await PublicTagController.insert({ name: faker.word.noun() })
    assert.isNotEmpty(row)
    id = row.id as any
  })

  test('update a tag', async () => {
    const newName = Math.random().toString()
    await PublicTagController.update({ id, name: newName })
    const rows = await db.select().from(publicTags).where(eq(publicTags.id, id))
    assert.equal(rows[0].name, newName)
  })

  test('Delete a tag', async () => {
    const res = await PublicTagController.remove({ id })
    assert.isTrue(res[0].id === id)
  })

  test('插入一个标签，但是标签名超出限制', async () => {
    const [err, res] = await to(
      PublicTagController.insert({ name: 'a'.repeat(FieldConstraints.MaxLen.TAG_NAME + 10) })
    )
    assert.isDefined(err)
    assert.isUndefined(res)
  })
})

describe('G: PublicBookmarkController', () => {
  const ctl = PublicBookmarkController
  test('CRUD:C insert a bookmark', async () => {
    const tags = await db.select({ id: publicTags.id }).from(publicTags).limit(2)
    const res = await ctl.insert({
      name: faker.word.noun(),
      url: faker.internet.url(),
      relatedTagIds: tags.map((el) => el.id),
    })
    assert.isNumber(res.id)
  })

  test('CRUD:R get a bookmark', async () => {
    const rows = await db.select().from(publicBookmarks).limit(1)
    const res = await ctl.query({ id: rows[0].id })
    assert.isObject(res)
  })

  test('CRUD:U update a bookmark', async () => {
    const rows = await db.select().from(publicBookmarks).limit(1)
    const newName = faker.word.noun()
    const res = await ctl.update({ id: rows[0].id, name: newName })
    // console.log(newName, res)
  })

  test('CRUD:D delete a bookmark', async () => {
    const rows = await db.select({ id: publicBookmarks.id }).from(publicBookmarks).limit(1)
    const res = await ctl.delete({ id: rows[0].id })
    assert.isTrue(res.length === 1)
  })

  test('inert same name bookmark', async () => {
    const rows = await db.select().from(publicBookmarks).limit(1)
    const [err, res] = await to(
      ctl.insert({
        name: rows[0].name,
        url: rows[0].url,
      })
    )
  })
})

describe('G: PublicTagToTag relations', async () => {
  let rows: any[] = []
  beforeAll(async () => {
    rows = await db
      .insert(publicTags)
      .values([
        { name: faker.word.noun() },
        { name: faker.word.noun() },
        { name: faker.word.noun() },
      ])
      .returning()
    console.log(rows)
  })
  afterAll(async () => {
    await db.delete(publicTags).where(
      inArray(
        publicTags.id,
        rows.map((r) => r.id)
      )
    )
  })

  test('update a tag with relations', async () => {
    await PublicTagController.update({ id: rows[0].id, relatedTagIds: [rows[1].id, rows[2].id] })
    const res = await db
      .select({ count: count() })
      .from(publicTagToTag)
      .where(eq(publicTagToTag.a, rows[0].id))
    assert.equal(res[0].count, 2)
  })

  test('delete a tag which has relations', async () => {
    await PublicTagController.remove({ id: rows[0].id })
    const res = await db
      .select({ count: count() })
      .from(publicTagToTag)
      .where(eq(publicTagToTag.a, rows[0].id))
    assert.equal(res[0].count, 0)
    const res2 = await db
      .select({ count: count() })
      .from(publicTags)
      .where(eq(publicTags.id, rows[0].id))
    assert.equal(res2[0].count, 0)
  })
})

describe('G: Bookmark to tag relations', () => {
  // 找到所有关联指定 tagId 的 bookmark
  test('find bookmarks that related special tagId', async () => {
    const tagId = 13
    const subQuery = db
      .select()
      .from(publicBookmarkToTag)
      .where(eq(publicBookmarkToTag.tId, tagId))
      .as('sq')

    const res = await db
      .select()
      .from(publicBookmarks)
      .innerJoin(subQuery, eq(publicBookmarks.id, subQuery.bId))

    // 结果中的 sq.tId 应该和等于 tagId
  })

  test('B', async () => {
    const tagId = 13
    const res = await db.query.publicBookmarks.findMany({
      where(fields, op) {
        // return op.sql`id IN (SELECT bId FROM publicBookmarkToTag WHERE tId IN (25, 48) GROUP BY bId HAVING COUNT(DISTINCT tId) = 2)`
        // return op.inArray(
        //   fields.id,
        //   op.sql`(SELECT bId FROM publicBookmarkToTag WHERE tId IN (25, 48) GROUP BY bId HAVING COUNT(DISTINCT tId) = 2)`
        // )
        return op.inArray(
          fields.id,
          db
            .select({ id: publicBookmarkToTag.bId })
            .from(publicBookmarkToTag)
            .where(inArray(publicBookmarkToTag.tId, [25, 48]))
            .groupBy(publicBookmarkToTag.bId)
            .having(op.sql`COUNT(DISTINCT tId) = 2`)
        )
      },
      with: { relatedTagIds: true },
    })
    const list = res.map((el) => ({
      ...el,
      relatedTagIds: el.relatedTagIds.map((item) => item.tId),
    }))
    console.log(list)
  })
})
