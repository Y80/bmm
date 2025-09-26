import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'
import CredentialsController from '../Credentials.controller'

describe('G: Credentials Controller', () => {
  const email = faker.internet.email()
  const password = faker.internet.password()

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
  const password = faker.internet.password()

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
      '用户名已存在'
    )
    await CredentialsController.delete(email)
  })

  test('密码错误', async () => {
    await CredentialsController.create({ email: email, password })
    await expect(
      CredentialsController.verify({ email: email, password: '123' })
    ).rejects.toThrowError('用户名或密码错误')
    await CredentialsController.delete(email)
  })
})
