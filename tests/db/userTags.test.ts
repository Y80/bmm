import { db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, test } from 'vitest'

describe('userTags CRUD', async () => {
  const user = (
    await db
      .insert(schema.users)
      .values({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      })
      .returning()
  ).pop()!

  afterAll(async () => {
    // userTags.userId 设置了级联删除，所以这里删除用户时会删除该用户下的所有标签
    await db.delete(schema.users).where(eq(schema.users.id, user.id))
  })

  const tag = await db
    .insert(schema.userTags)
    .values({ name: faker.word.noun(), userId: user.id })
    .returning()
    .then((res) => res.pop()!)
  console.log(tag)

  test('read', async () => {
    const data = await db.query.userTags.findFirst({
      where: eq(schema.userTags.id, tag.id),
    })
    expect(data).toBeDefined()
  })

  test('同一用户下创建了同名的标签', async () => {
    const task = db.insert(schema.userTags).values({
      name: tag.name,
      userId: user.id,
    })
    await expect(task).rejects.toThrowError('UNIQUE constraint failed: userTags.name')
  })

  test.sequential('update', async () => {
    const name = faker.word.noun()
    const data = await db
      .update(schema.userTags)
      .set({ name })
      .where(eq(schema.userTags.id, tag.id))
      .returning()
    expect(data?.pop()?.name).toBe(name)
  })

  test.sequential('delete', async () => {
    const data = await db.delete(schema.userTags).where(eq(schema.userTags.id, tag.id)).returning()
    expect(data?.pop()?.id).toBe(tag.id)
  })
})
