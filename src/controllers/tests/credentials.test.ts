import { faker } from '@faker-js/faker'
import { afterAll, describe, expect, test } from 'vitest'
import CredentialsController from '../Credentials.controller'

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
