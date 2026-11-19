import { faker } from '@faker-js/faker'
import { eq, inArray } from 'drizzle-orm'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { findManyBookmarksSchema } from '../schemas'
import BookmarkHostCheckController from '../BookmarkHostCheck.controller'
import PublicBookmarkController from '../PublicBookmark.controller'
import UserBookmarkController from '../UserBookmark.controller'
import * as http from '@/utils/http'

vi.mock('@/utils/http', async () => {
  const actual = await vi.importActual('@/utils/http')
  return {
    ...actual,
    fetchRequest: vi.fn(),
  }
})

vi.mock('@/controllers/SiteSetting.controller', () => ({
  default: { getProxyUrl: vi.fn(() => '') },
}))

vi.mock('@/lib/auth', () => ({ getAuthedUserId: vi.fn() }))

const { bookmarkHostChecks, publicBookmarks, siteConfigs, userBookmarks, users } = schema

const createdBookmarkIds: number[] = []
const touchedHostKeys = new Set<string>()
const CHECK_HOSTS_TASK_KEY = 'checkHostsTask'

function createBookmarkName(prefix = 'host-check') {
  return `${prefix}-${faker.string.alphanumeric(12)}`
}

function createUrl(host = faker.internet.domainName()) {
  return `https://${host}/docs/${faker.string.uuid()}`
}

function mockFetchStatus(status: number) {
  vi.mocked(http.fetchRequest).mockResolvedValue({
    status,
    headers: {},
    body: Buffer.from(''),
    effectiveUrl: '',
  })
}

async function createPublicBookmark(input: { name?: string; url?: string }) {
  const row = await PublicBookmarkController.insert({
    name: input.name || createBookmarkName(),
    url: input.url || createUrl(),
  })
  createdBookmarkIds.push(row.id)
  row.hostKey && touchedHostKeys.add(row.hostKey)
  return row
}

async function waitForPublicCheckHostsTaskFinished() {
  const start = Date.now()
  while (Date.now() - start < 2000) {
    const task = await BookmarkHostCheckController.getPublicCheckHostsTask()
    if (task?.finishedAt) return task
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  throw new Error('等待站点检测任务完成超时')
}

async function markOtherPublicHostsFresh(pendingHostKeys: Set<string>) {
  const rows = await db
    .select({ hostKey: publicBookmarks.hostKey })
    .from(publicBookmarks)
  const hostKeys = [
    ...new Set(
      rows
        .map((item) => item.hostKey)
        .filter(
          (hostKey): hostKey is string =>
            typeof hostKey === 'string' && !pendingHostKeys.has(hostKey)
        )
    ),
  ]
  if (!hostKeys.length) return

  const now = new Date()
  await db
    .insert(bookmarkHostChecks)
    .values(
      hostKeys.map((hostKey) => ({
        hostKey,
        status: 'reachable' as const,
        httpStatus: 200,
        errorMessage: null,
        checkedAt: now,
      }))
    )
    .onConflictDoUpdate({
      target: bookmarkHostChecks.hostKey,
      set: {
        status: 'reachable',
        httpStatus: 200,
        errorMessage: null,
        checkedAt: now,
        updatedAt: now,
      },
    })
}

describe('G: BookmarkHostCheckController', { concurrent: false }, () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    mockFetchStatus(200)
    await db.delete(siteConfigs).where(eq(siteConfigs.key, CHECK_HOSTS_TASK_KEY))
  })

  afterAll(async () => {
    if (createdBookmarkIds.length) {
      await db.delete(publicBookmarks).where(inArray(publicBookmarks.id, createdBookmarkIds))
    }
    if (touchedHostKeys.size) {
      await db
        .delete(bookmarkHostChecks)
        .where(inArray(bookmarkHostChecks.hostKey, [...touchedHostKeys]))
    }
    await db.delete(siteConfigs).where(eq(siteConfigs.key, CHECK_HOSTS_TASK_KEY))
  })

  test('public bookmark insert and url update write hostKey', async () => {
    const row = await createPublicBookmark({ url: 'https://example.com/a' })
    expect(row.hostKey).toBe('https://example.com')

    await PublicBookmarkController.update({ id: row.id, url: 'https://example.org/b' })
    touchedHostKeys.add('https://example.org')

    const [updated] = await db
      .select({ hostKey: publicBookmarks.hostKey })
      .from(publicBookmarks)
      .where(eq(publicBookmarks.id, row.id))
    expect(updated.hostKey).toBe('https://example.org')
  })

  test('2xx and 3xx responses are reachable', async () => {
    mockFetchStatus(302)
    const result = await BookmarkHostCheckController.checkHost('https://redirect.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('reachable')
    expect(result.httpStatus).toBe(302)
    expect(result.errorMessage).toBeNull()
  })

  test.each([200, 403, 503])('Cloudflare challenge header marks HTTP %i as restricted', async (status) => {
    vi.mocked(http.fetchRequest).mockResolvedValue({
      status,
      headers: { 'CF-Mitigated': 'challenge', server: 'cloudflare' },
      body: Buffer.from(''),
      effectiveUrl: '',
    })

    const result = await BookmarkHostCheckController.checkHost('https://cloudflare-challenge.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('restricted')
    expect(result.httpStatus).toBe(status)
    expect(result.errorMessage).toBe('需要在浏览器中完成验证')
    expect(http.fetchRequest).toHaveBeenCalledTimes(1)
  })

  test.each([
    [
      'Cloudflare',
      '<script src="/cdn-cgi/challenge-platform/check.js"></script>',
      '需要在浏览器中完成验证',
    ],
    ['Vercel', '<title>Vercel Security Checkpoint</title>', '需要在浏览器中完成验证'],
    ['plain', '<title>Forbidden</title>', '检测请求被拒绝（HTTP 403），实际访问情况请在浏览器中确认'],
  ])('recognizes %s HTTP 403 after falling back to GET', async (kind, html, message) => {
    vi.mocked(http.fetchRequest)
      .mockResolvedValueOnce({
        status: 403,
        headers: {},
        body: Buffer.from(''),
        effectiveUrl: '',
      })
      .mockResolvedValueOnce({
        status: 403,
        headers: { 'content-type': 'text/html', server: kind === 'Vercel' ? 'Vercel' : 'cloudflare' },
        body: Buffer.from(html),
        effectiveUrl: '',
      })

    const result = await BookmarkHostCheckController.checkHost(
      `https://${kind.toLowerCase()}-body.example`
    )
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('restricted')
    expect(result.httpStatus).toBe(403)
    expect(result.errorMessage).toBe(message)
    expect(http.fetchRequest).toHaveBeenCalledTimes(2)
  })

  test('host check requests use browser-like headers', async () => {
    mockFetchStatus(200)

    const result = await BookmarkHostCheckController.checkHost('https://headers.example')
    touchedHostKeys.add(result.hostKey)

    expect(http.fetchRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://headers.example',
        method: 'HEAD',
      })
    )
  })

  test('host check falls back to GET when HEAD is not reachable', async () => {
    vi.mocked(http.fetchRequest)
      .mockResolvedValueOnce({
        status: 403,
        headers: {},
        body: Buffer.from(''),
        effectiveUrl: '',
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: Buffer.from(''),
        effectiveUrl: '',
      })

    const result = await BookmarkHostCheckController.checkHost('https://head-forbidden.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('reachable')
    expect(result.httpStatus).toBe(200)
    expect(http.fetchRequest).toHaveBeenCalledTimes(2)
    expect(http.fetchRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ method: 'HEAD' })
    )
    expect(http.fetchRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ method: 'GET' })
    )
  })

  test('a successful GET stays reachable when HTML only references challenge scripts', async () => {
    vi.mocked(http.fetchRequest)
      .mockResolvedValueOnce({
        status: 405,
        headers: {},
        body: Buffer.alloc(0),
        effectiveUrl: '',
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: Buffer.from('<script src="/cdn-cgi/challenge-platform/injected.js"></script>'),
        effectiveUrl: '',
      })

    const result = await BookmarkHostCheckController.checkHost('https://successful-body.example')
    touchedHostKeys.add(result.hostKey)

    expect(result).toMatchObject({ status: 'reachable', httpStatus: 200, errorMessage: null })
  })

  test('host check does not start GET after HEAD consumes the timeout budget', async () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(30_000)
    vi.mocked(http.fetchRequest).mockRejectedValue(
      new DOMException('The operation was aborted due to timeout', 'TimeoutError')
    )

    const result = await BookmarkHostCheckController.checkHost('https://head-timeout.example', {
      timeout: 30_000,
    })
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('unreachable')
    expect(result.errorMessage).toBe('请求超时')
    expect(http.fetchRequest).toHaveBeenCalledTimes(1)
  })

  test.each([
    [404, '404：网页未找到'],
    [500, '500：服务器内部错误'],
  ])('plain HTTP %i is unreachable with the existing message', async (status, message) => {
    mockFetchStatus(status)
    const result = await BookmarkHostCheckController.checkHost(`https://http-${status}.example`)
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('unreachable')
    expect(result.httpStatus).toBe(status)
    expect(result.errorMessage).toBe(message)
  })

  test('network errors are unreachable without http status', async () => {
    vi.mocked(http.fetchRequest).mockRejectedValue(
      Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
    )

    const result = await BookmarkHostCheckController.checkHost('https://dns-missing.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('unreachable')
    expect(result.httpStatus).toBeNull()
    expect(result.errorMessage).toBe('域名解析失败')
  })

  test('same host is checked once in batch and null hostKey is skipped', async () => {
    const prefix = createBookmarkName('batch-host')
    const urlHost = `${faker.string.uuid()}.example.com`
    const first = await createPublicBookmark({ name: `${prefix}-a`, url: `https://${urlHost}/a` })
    const second = await createPublicBookmark({ name: `${prefix}-b`, url: `https://${urlHost}/b` })
    const restricted = await createPublicBookmark({ name: `${prefix}-restricted` })
    const invalid = await db
      .insert(publicBookmarks)
      .values({ name: `${prefix}-null`, url: `https://${faker.string.uuid()}.example.com/null` })
      .returning()
    createdBookmarkIds.push(invalid[0].id)
    await db.update(publicBookmarks).set({ hostKey: null }).where(eq(publicBookmarks.id, invalid[0].id))
    first.hostKey && touchedHostKeys.add(first.hostKey)
    second.hostKey && touchedHostKeys.add(second.hostKey)

    vi.mocked(http.fetchRequest).mockImplementation(async ({ url }) => ({
      status: url === restricted.hostKey ? 403 : 200,
      headers: {},
      body: Buffer.alloc(0),
      effectiveUrl: url,
    }))

    const result = await PublicBookmarkController.batchCheckHosts(
      findManyBookmarksSchema.parse({ keyword: prefix })
    )

    expect(result).toEqual({ total: 2, reachable: 1, restricted: 1, unreachable: 0, skipped: 1 })
    expect(http.fetchRequest).toHaveBeenCalledTimes(3)
  })

  test('check all hosts task writes JSON config and skips fresh checked hosts', async () => {
    const prefix = createBookmarkName('task-host')
    const duplicateHost = `${faker.string.uuid()}.example.com`
    const freshHost = `${faker.string.uuid()}.example.com`
    const pendingA = await createPublicBookmark({ name: `${prefix}-a`, url: `https://${duplicateHost}/a` })
    const pendingB = await createPublicBookmark({ name: `${prefix}-b`, url: `https://${duplicateHost}/b` })
    const fresh = await createPublicBookmark({ name: `${prefix}-fresh`, url: `https://${freshHost}/a` })
    const invalid = await db
      .insert(publicBookmarks)
      .values({ name: `${prefix}-null`, url: `https://${faker.string.uuid()}.example.com/null` })
      .returning()
    createdBookmarkIds.push(invalid[0].id)
    await db.update(publicBookmarks).set({ hostKey: null }).where(eq(publicBookmarks.id, invalid[0].id))
    pendingA.hostKey && touchedHostKeys.add(pendingA.hostKey)
    pendingB.hostKey && touchedHostKeys.add(pendingB.hostKey)
    fresh.hostKey && touchedHostKeys.add(fresh.hostKey)
    await markOtherPublicHostsFresh(new Set([pendingA.hostKey!]))
    await db
      .insert(bookmarkHostChecks)
      .values({
        hostKey: fresh.hostKey!,
        status: 'reachable',
        httpStatus: 200,
        errorMessage: null,
        checkedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: bookmarkHostChecks.hostKey,
        set: {
          status: 'reachable',
          httpStatus: 200,
          errorMessage: null,
          checkedAt: new Date(),
        },
      })

    mockFetchStatus(403)

    const startedTask = await BookmarkHostCheckController.startPublicCheckHostsTask()
    expect(startedTask).toMatchObject({
      finishedAt: null,
      total: 1,
      checked: 0,
      errorMessage: null,
    })
    expect('progress' in startedTask).toBe(false)

    const finishedTask = await waitForPublicCheckHostsTaskFinished()
    expect(finishedTask).toMatchObject({
      total: 1,
      checked: 1,
      errorMessage: null,
    })
    expect(http.fetchRequest).toHaveBeenCalledTimes(2)
    const check = await db.query.bookmarkHostChecks.findFirst({
      where: eq(bookmarkHostChecks.hostKey, pendingA.hostKey!),
    })
    expect(check).toMatchObject({ status: 'restricted', httpStatus: 403 })

    const row = await db.query.siteConfigs.findFirst({
      where: eq(siteConfigs.key, CHECK_HOSTS_TASK_KEY),
    })
    expect(row?.value).toMatchObject({
      startedAt: expect.any(String),
      finishedAt: expect.any(String),
      total: 1,
      checked: 1,
    })
    expect(typeof row?.value).toBe('object')
    expect('progress' in (row?.value as Record<string, unknown>)).toBe(false)
  })

  test('check all hosts task does not start duplicate task when one is running', async () => {
    const runningTask = {
      startedAt: new Date().toISOString(),
      finishedAt: null,
      total: 2,
      checked: 0,
      errorMessage: null,
    }
    await db.insert(siteConfigs).values({
      key: CHECK_HOSTS_TASK_KEY,
      value: runningTask,
    })
    mockFetchStatus(200)

    const task = await BookmarkHostCheckController.startPublicCheckHostsTask()

    expect(task).toEqual(runningTask)
    expect(http.fetchRequest).not.toHaveBeenCalled()
  })

  test('check all hosts task uses 30s timeout and at most 5 concurrent checks', async () => {
    const prefix = createBookmarkName('task-concurrent')
    const rows = await Promise.all(
      Array.from({ length: 7 }, (_, index) =>
        createPublicBookmark({
          name: `${prefix}-${index}`,
          url: `https://${faker.string.uuid()}.example.com/a`,
        })
      )
    )
    rows.forEach((row) => row.hostKey && touchedHostKeys.add(row.hostKey))
    await markOtherPublicHostsFresh(new Set(rows.map((row) => row.hostKey!)))
    let active = 0
    let maxActive = 0
    const timeouts: Array<number | undefined> = []
    const spy = vi.spyOn(BookmarkHostCheckController, 'checkHost').mockImplementation(
      async (hostKey, opts) => {
        timeouts.push(opts?.timeout)
        active += 1
        maxActive = Math.max(maxActive, active)
        await new Promise((resolve) => setTimeout(resolve, 30))
        active -= 1
        return {
          hostKey,
          status: 'reachable',
          httpStatus: 200,
          errorMessage: null,
          checkedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Awaited<ReturnType<typeof BookmarkHostCheckController.checkHost>>
      }
    )

    const startedTask = await BookmarkHostCheckController.startPublicCheckHostsTask()
    expect(startedTask.total).toBe(7)
    const finishedTask = await waitForPublicCheckHostsTaskFinished()

    expect(finishedTask.checked).toBe(7)
    expect(spy).toHaveBeenCalledTimes(7)
    expect(new Set(timeouts)).toEqual(new Set([30_000]))
    expect(maxActive).toBeLessThanOrEqual(5)
  })

  test('both bookmark lists group saved and historical restricted results consistently', async () => {
    const prefix = createBookmarkName('filter-host')
    const unchecked = await createPublicBookmark({ name: `${prefix}-unchecked` })
    const reachable = await createPublicBookmark({ name: `${prefix}-reachable` })
    const unreachable = await createPublicBookmark({ name: `${prefix}-unreachable` })
    const historical = await createPublicBookmark({ name: `${prefix}-historical-403` })
    const previouslyReachable = await createPublicBookmark({ name: `${prefix}-reachable-403` })
    const restricted = await createPublicBookmark({ name: `${prefix}-restricted` })
    const oldCheckedAt = new Date('2026-01-01T00:00:00Z')

    await db.insert(bookmarkHostChecks).values([
      {
        hostKey: reachable.hostKey!,
        status: 'reachable',
        httpStatus: 200,
        errorMessage: null,
      },
      {
        hostKey: unreachable.hostKey!,
        status: 'unreachable',
        httpStatus: 500,
        errorMessage: '500：服务器内部错误',
      },
      {
        hostKey: historical.hostKey!,
        status: 'unreachable',
        httpStatus: 403,
        errorMessage: '403：访问被拒绝',
        checkedAt: oldCheckedAt,
      },
      {
        hostKey: previouslyReachable.hostKey!,
        status: 'reachable',
        httpStatus: 403,
        errorMessage: null,
      },
      {
        hostKey: restricted.hostKey!,
        status: 'restricted',
        httpStatus: 503,
        errorMessage: '需要在浏览器中完成验证',
      },
    ])

    const [owner] = await db.insert(users).values({ email: faker.internet.email() }).returning()
    vi.mocked(getAuthedUserId).mockResolvedValue(owner.id)
    try {
      await db.insert(userBookmarks).values(
        [unchecked, reachable, unreachable, historical, previouslyReachable, restricted].map(
          ({ name, url, hostKey }) => ({ name, url, hostKey, userId: owner.id })
        )
      )

      const groups = [
        ['unchecked', [unchecked.name]],
        ['reachable', [reachable.name]],
        ['unreachable', [unreachable.name]],
        ['restricted', [historical.name, previouslyReachable.name, restricted.name]],
      ] as const
      for (const controller of [PublicBookmarkController, UserBookmarkController]) {
        for (const [status, names] of groups) {
          const result = await controller.findMany(
            findManyBookmarksSchema.parse({
              keyword: prefix,
              hostCheckStatus: status,
              includeHostCheckSummary: true,
            })
          )
          expect(result.total).toBe(names.length)
          expect(result.list.map((item) => item.name).sort()).toEqual([...names].sort())
          expect(result.list.every((item) => item.hostCheckStatus === status)).toBe(true)
          if (status === 'restricted') {
            expect(result.list.find((item) => item.name === historical.name)).toMatchObject({
              hostCheckedAt: oldCheckedAt,
              hostCheckHttpStatus: 403,
              hostCheckErrorMessage: '检测请求被拒绝（HTTP 403），实际访问情况请在浏览器中确认',
            })
            expect(
              result.list.find((item) => item.name === restricted.name)?.hostCheckErrorMessage
            ).toBe('需要在浏览器中完成验证')
          }
        }
      }
    } finally {
      await db.delete(userBookmarks).where(eq(userBookmarks.userId, owner.id))
      await db.delete(users).where(eq(users.id, owner.id))
    }
  })
})
