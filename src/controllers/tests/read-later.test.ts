import { faker } from '@faker-js/faker'
import { eq, inArray } from 'drizzle-orm'
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { db, schema } from '@/db'
import { analyzeReadLaterArticle } from '@/lib/ai'
import { to } from '@/utils'
import fetchHtml from '@/utils/fetch-html'
import UserReadLaterController from '../UserReadLater.controller'

let authedUserId = ''

vi.mock('@/lib/auth', () => ({
  getAuthedUserId: vi.fn(() => Promise.resolve(authedUserId)),
}))

vi.mock('@/utils/fetch-html', () => ({
  default: vi.fn((url: string) =>
    Promise.resolve({
      html: `
        <html>
          <head>
            <title>测试页面标题</title>
            <meta name="description" content="这是页面里的描述摘要，用于 AI 失败时回退。" />
          </head>
          <body><article><p>测试文章内容</p></article></body>
        </html>
      `,
      url,
    })
  ),
}))

vi.mock('@/lib/ai', () => ({
  analyzeReadLaterArticle: vi.fn(() =>
    Promise.resolve({
      title: '测试文章',
      summary: '这是一段用于测试稍后阅读功能的文章摘要。',
      estimatedReadingMinutes: 1,
    })
  ),
}))

const { userReadLaterItems, users } = schema

describe('G: UserReadLaterController', { sequential: true }, () => {
  let userA = ''
  let userB = ''

  beforeAll(async () => {
    const rows = await db
      .insert(users)
      .values([
        { email: faker.internet.email(), name: faker.person.firstName() },
        { email: faker.internet.email(), name: faker.person.firstName() },
      ])
      .returning({ id: users.id })
    userA = rows[0].id
    userB = rows[1].id
  })

  beforeEach(async () => {
    authedUserId = userA
    vi.mocked(fetchHtml).mockResolvedValue({
      html: `
        <html>
          <head>
            <title>测试页面标题</title>
            <meta name="description" content="这是页面里的描述摘要，用于 AI 失败时回退。" />
          </head>
          <body><article><p>测试文章内容</p></article></body>
        </html>
      `,
      url: faker.internet.url(),
    })
    await db.delete(userReadLaterItems).where(inArray(userReadLaterItems.userId, [userA, userB]))
  })

  afterAll(async () => {
    await db.delete(users).where(inArray(users.id, [userA, userB]))
  })

  test('create unread item from url', async () => {
    const result = await UserReadLaterController.createFromUrl({ url: faker.internet.url() })
    const row = result.item

    expect(row.status).toBe('unread')
    expect(row.title).toBe('测试文章')
    expect(row.summary).toBeTruthy()
    expect(row.estimatedReadingMinutes).toBe(1)
    expect(result.mode).toBe('ai')
  })

  test('same user cannot create duplicated url', async () => {
    const url = faker.internet.url()
    vi.mocked(fetchHtml).mockResolvedValue({
      html: `
        <html>
          <head>
            <title>测试页面标题</title>
            <meta name="description" content="这是页面里的描述摘要，用于 AI 失败时回退。" />
          </head>
          <body><article><p>测试文章内容</p></article></body>
        </html>
      `,
      url,
    })
    await UserReadLaterController.createFromUrl({ url })

    const [err, res] = await to(UserReadLaterController.createFromUrl({ url }))

    expect(err).toBeDefined()
    expect(res).toBeUndefined()
  })

  test('different users can create same url', async () => {
    const url = faker.internet.url()
    vi.mocked(fetchHtml).mockResolvedValue({
      html: `
        <html>
          <head>
            <title>测试页面标题</title>
            <meta name="description" content="这是页面里的描述摘要，用于 AI 失败时回退。" />
          </head>
          <body><article><p>测试文章内容</p></article></body>
        </html>
      `,
      url,
    })
    await UserReadLaterController.createFromUrl({ url })
    authedUserId = userB

    await expect(UserReadLaterController.createFromUrl({ url })).resolves.toMatchObject({
      item: { url },
    })
  })

  test('mark unread item as read', async () => {
    const created = await UserReadLaterController.createFromUrl({ url: faker.internet.url() })
    const row = created.item

    const readItem = await UserReadLaterController.markRead({ id: row.id })

    expect(readItem.status).toBe('read')
    expect(readItem.readAt).toBeInstanceOf(Date)
  })

  test('create item with url fallback when fetching html fails', async () => {
    const url = faker.internet.url()
    vi.mocked(fetchHtml).mockRejectedValue(new Error('获取 HTML 失败'))

    const result = await UserReadLaterController.createFromUrl({ url })

    expect(result.mode).toBe('url')
    expect(result.item.url).toBe(url)
    expect(result.item.title).toBe(url)
    expect(result.item.summary).toContain('暂时无法获取页面内容')
  })

  test('create item with html extracted content when ai analysis fails', async () => {
    const url = faker.internet.url()
    vi.mocked(fetchHtml).mockResolvedValue({
      html: `
        <html>
          <head>
            <title>测试页面标题</title>
            <meta
              name="description"
              content="这是页面里的描述摘要，用于 AI 失败时回退。内容足够明确，方便断言。"
            />
          </head>
          <body><article><p>测试文章内容</p></article></body>
        </html>
      `,
      url,
    })
    vi.mocked(analyzeReadLaterArticle).mockRejectedValueOnce(new Error('大模型供应商未启用'))

    const result = await UserReadLaterController.createFromUrl({ url })
    const row = result.item

    expect(row.status).toBe('unread')
    expect(row.url).toBe(url)
    expect(row.title).toBe('测试页面标题')
    expect(row.summary).toContain('这是页面里的描述摘要')
    expect(row.estimatedReadingMinutes).toBe(1)
    expect(result.mode).toBe('html')
  })

  test('read and unread items can be deleted', async () => {
    const unread = await UserReadLaterController.createFromUrl({ url: faker.internet.url() })
    const read = await UserReadLaterController.markRead({ id: unread.item.id })

    await expect(UserReadLaterController.delete({ id: read.id })).resolves.toHaveLength(1)
    await expect(db.$count(userReadLaterItems, eq(userReadLaterItems.id, read.id))).resolves.toBe(0)
  })

  test('user cannot operate another user item', async () => {
    const created = await UserReadLaterController.createFromUrl({ url: faker.internet.url() })
    const row = created.item
    authedUserId = userB

    await expect(UserReadLaterController.markRead({ id: row.id })).rejects.toThrowError()
    await expect(UserReadLaterController.delete({ id: row.id })).rejects.toThrowError()
  })

  test('user can manually update icon title and summary', async () => {
    const created = await UserReadLaterController.createFromUrl({ url: faker.internet.url() })

    const updated = await UserReadLaterController.update({
      id: created.item.id,
      icon: 'https://example.com/icon.png',
      title: '手动修改后的标题',
      summary: '手动修改后的摘要内容。',
    })

    expect(updated.icon).toBe('https://example.com/icon.png')
    expect(updated.title).toBe('手动修改后的标题')
    expect(updated.summary).toBe('手动修改后的摘要内容。')
  })
})
