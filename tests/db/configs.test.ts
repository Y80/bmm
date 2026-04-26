import { db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { and, count, eq } from 'drizzle-orm'
import { afterAll, describe, expect, test } from 'vitest'

const siteConfigKey = `site.test.${faker.string.uuid()}`
const userConfigKey = `user.test.${faker.string.uuid()}`
type ConfigValue = typeof schema.siteConfigs.$inferInsert.value

describe('configs', async () => {
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
    await db.delete(schema.siteConfigs).where(eq(schema.siteConfigs.key, siteConfigKey))
    await db.delete(schema.users).where(eq(schema.users.id, user.id))
  })

  test('网站配置支持 JSON 值并限制 key 唯一', async () => {
    const value: ConfigValue = {
      title: 'BMM',
      features: ['bookmarks', 'tags'],
      limits: { upload: 10 },
      enabled: true,
    }

    const rows = await db
      .insert(schema.siteConfigs)
      .values({ key: siteConfigKey, value, description: '测试网站配置' })
      .returning()

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      key: siteConfigKey,
      value,
      version: 1,
      description: '测试网站配置',
    })

    await expect(
      db.insert(schema.siteConfigs).values({ key: siteConfigKey, value: { duplicated: true } })
    ).rejects.toThrowError(/Failed query|UNIQUE constraint failed|duplicate key/)
  })

  test('用户配置按 userId 和 key 限制唯一', async () => {
    const value: ConfigValue = {
      layout: 'grid',
      pageSize: 24,
      showDescription: false,
    }

    const rows = await db
      .insert(schema.userConfigs)
      .values({ userId: user.id, key: userConfigKey, value })
      .returning()

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      userId: user.id,
      key: userConfigKey,
      value,
      version: 1,
    })

    await expect(
      db
        .insert(schema.userConfigs)
        .values({ userId: user.id, key: userConfigKey, value: { layout: 'list' } })
    ).rejects.toThrowError(/Failed query|UNIQUE constraint failed|duplicate key/)
  })

  test('删除用户时级联删除用户配置', async () => {
    const cascadeUser = (
      await db
        .insert(schema.users)
        .values({
          name: faker.person.fullName(),
          email: faker.internet.email(),
        })
        .returning()
    ).pop()!
    const key = `user.cascade.${faker.string.uuid()}`

    await db
      .insert(schema.userConfigs)
      .values({ userId: cascadeUser.id, key, value: { removable: true } })

    await db.delete(schema.users).where(eq(schema.users.id, cascadeUser.id))

    const rows = await db
      .select({ count: count() })
      .from(schema.userConfigs)
      .where(and(eq(schema.userConfigs.userId, cascadeUser.id), eq(schema.userConfigs.key, key)))

    expect(rows[0].count).toBe(0)
  })
})
