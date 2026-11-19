import { db, schema } from '@/db'
import { faker } from '@faker-js/faker'
import { and, count, eq } from 'drizzle-orm'
import { afterAll, describe, expect, test } from 'vitest'
import CredentialsController from '../Credentials.controller'
import UserController from '../User.controller'

function createValidPassword() {
  return faker.string.alphanumeric(12)
}

describe('G: Credentials Controller', { concurrent: false }, () => {
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

describe('G: 创建账户时的各种异常', { concurrent: false }, () => {
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

describe('G: 删除用户时清理关联数据', { concurrent: false }, () => {
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

    const expires = new Date(Date.now() + 60_000)
    await db.insert(schema.userReadLaterItems).values({
      userId: user.id,
      url: 'https://example.com/read-later',
      title: '稍后阅读',
      summary: '测试摘要',
    })
    await db.insert(schema.userConfigs).values({ userId: user.id, key: 'test', value: true })
    await db.insert(schema.sessions).values({
      userId: user.id,
      sessionToken: faker.string.uuid(),
      expires,
    })
    await db.insert(schema.authenticators).values({
      userId: user.id,
      providerAccountId: email,
      credentialID: faker.string.uuid(),
      credentialPublicKey: 'fixture-key',
      counter: 0,
      credentialDeviceType: 'singleDevice',
      credentialBackedUp: false,
    })
    await db.insert(schema.verificationTokens).values({
      identifier: email,
      token: faker.string.uuid(),
      expires,
    })

    await UserController.delete(user.id)

    await expect(db.$count(schema.users, eq(schema.users.id, user.id))).resolves.toBe(0)
    const ownedTables = [
      schema.credentials,
      schema.accounts,
      schema.sessions,
      schema.authenticators,
      schema.userTags,
      schema.userBookmarks,
      schema.userReadLaterItems,
      schema.userConfigs,
    ]
    for (const table of ownedTables) {
      await expect(db.$count(table, eq(table.userId, user.id))).resolves.toBe(0)
    }
    await expect(
      db.$count(schema.verificationTokens, eq(schema.verificationTokens.identifier, email))
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

describe('G: 重设密码', { concurrent: false }, () => {
  const email = faker.internet.email()
  const oldPassword = createValidPassword()
  const newPassword = createValidPassword()

  afterAll(async () => {
    try {
      await CredentialsController.delete(email)
    } catch {}
  })

  test('reset existing credentials password', async () => {
    await CredentialsController.create({ email, password: oldPassword })

    await CredentialsController.resetPassword({ email, password: newPassword })

    await expect(
      CredentialsController.verify({ email, password: oldPassword })
    ).rejects.toThrowError('邮箱或密码错误，请检查后重试')

    await expect(
      CredentialsController.verify({ email, password: newPassword })
    ).resolves.toMatchObject({ email })
  })
})

describe('G: 为第三方账号补建密码登录', { concurrent: false }, () => {
  const email = faker.internet.email()
  const password = createValidPassword()

  afterAll(async () => {
    try {
      await CredentialsController.delete(email)
    } catch {}
  })

  test('reset password creates credentials auth records when absent', async () => {
    const [user] = await db
      .insert(schema.users)
      .values({
        email,
        name: faker.person.firstName(),
      })
      .returning()

    await db.insert(schema.accounts).values({
      userId: user.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: faker.string.numeric(8),
    })

    await CredentialsController.resetPassword({ email, password })

    await expect(CredentialsController.verify({ email, password })).resolves.toMatchObject({ email })
    await expect(db.$count(schema.credentials, eq(schema.credentials.userId, user.id))).resolves.toBe(1)
    await expect(
      db.$count(
        schema.accounts,
        and(
          eq(schema.accounts.provider, 'credentials'),
          eq(schema.accounts.providerAccountId, email)
        )
      )
    ).resolves.toBe(1)
  })
})
