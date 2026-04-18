import { db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { count, eq } from 'drizzle-orm'
import { afterAll, describe, expect, test } from 'vitest'
import CredentialsController from '../Credentials.controller'
import UserController from '../User.controller'

function createValidPassword() {
  return faker.string.alphanumeric(12)
}

describe('G: Credentials Controller', { sequential: true }, () => {
  const email = faker.internet.email()
  const password = createValidPassword()

  afterAll(async () => {
    try {
      await CredentialsController.delete(email)
    } catch {}
  })

  test('create', async () => {
    await CredentialsController.create({ email, password })
  })

  test('verify', async () => {
    const user = await CredentialsController.verify({ email, password })
    console.log({ user })
  })
})

describe('G: 创建账户时的各种异常', { sequential: true }, () => {
  const email = faker.internet.email()
  const password = createValidPassword()

  afterAll(async () => {
    try {
      await CredentialsController.delete(email)
    } catch {}
  })

  test('用户名必须是邮箱', async () => {
    await expect(CredentialsController.create({ email: '123', password })).rejects.toThrowError()
  })

  test('密码至少为 6 个字符', async () => {
    await expect(
      CredentialsController.create({ email: email, password: '123' })
    ).rejects.toThrowError()
  })

  test('用户名已存在', async () => {
    await CredentialsController.create({ email: email, password })
    await expect(CredentialsController.create({ email: email, password })).rejects.toThrowError(
      '邮箱已被注册使用'
    )
  })

  test('密码错误', async () => {
    try {
      await CredentialsController.create({ email: email, password })
    } catch {}
    await expect(
      CredentialsController.verify({ email: email, password: createValidPassword() })
    ).rejects.toThrowError('邮箱或密码错误，请检查后重试')
  })
})

describe('G: 删除用户时清理关联数据', { sequential: true }, () => {
  const email = faker.internet.email()
  const password = createValidPassword()

  afterAll(async () => {
    try {
      await CredentialsController.delete(email)
    } catch {}
  })

  test('delete user with bookmarks, tags and auth data', async () => {
    await CredentialsController.create({ email, password })
    const user = await CredentialsController.verify({ email, password })

    const [tagA, tagB] = await db
      .insert(schema.userTags)
      .values([
        { name: faker.word.noun(), userId: user.id },
        { name: faker.word.noun(), userId: user.id },
      ])
      .returning()

    await db.insert(schema.userTagToTag).values({ a: tagA.id, b: tagB.id })

    const [bookmark] = await db
      .insert(schema.userBookmarks)
      .values({
        name: faker.word.noun(),
        url: faker.internet.url(),
        userId: user.id,
      })
      .returning()

    await db.insert(schema.userBookmarkToTag).values([
      { bId: bookmark.id, tId: tagA.id },
      { bId: bookmark.id, tId: tagB.id },
    ])

    await UserController.delete(user.id)

    await expect(db.$count(schema.users, eq(schema.users.id, user.id))).resolves.toBe(0)
    await expect(db.$count(schema.credentials, eq(schema.credentials.userId, user.id))).resolves.toBe(0)
    await expect(db.$count(schema.accounts, eq(schema.accounts.userId, user.id))).resolves.toBe(0)
    await expect(db.$count(schema.userTags, eq(schema.userTags.userId, user.id))).resolves.toBe(0)
    await expect(
      db.$count(schema.userBookmarks, eq(schema.userBookmarks.userId, user.id))
    ).resolves.toBe(0)

    const [{ totalTagRefs }] = await db
      .select({ totalTagRefs: count() })
      .from(schema.userTagToTag)
      .where(eq(schema.userTagToTag.a, tagA.id))
    expect(totalTagRefs).toBe(0)

    const [{ totalBookmarkRefs }] = await db
      .select({ totalBookmarkRefs: count() })
      .from(schema.userBookmarkToTag)
      .where(eq(schema.userBookmarkToTag.bId, bookmark.id))
    expect(totalBookmarkRefs).toBe(0)
  })
})
