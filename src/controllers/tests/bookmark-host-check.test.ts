import { faker } from '@faker-js/faker'
import { eq, inArray } from 'drizzle-orm'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { db, schema } from '@/db'
import { findManyBookmarksSchema } from '../schemas'
import BookmarkHostCheckController from '../BookmarkHostCheck.controller'
import PublicBookmarkController from '../PublicBookmark.controller'

const { bookmarkHostChecks, publicBookmarks, siteConfigs } = schema

const createdBookmarkIds: number[] = []
const touchedHostKeys = new Set<string>()
const CHECK_HOSTS_TASK_KEY = 'checkHostsTask'

function createBookmarkName(prefix = 'host-check') {
  return `${prefix}-${faker.string.uuid()}`
}

function createUrl(host = faker.internet.domainName()) {
  return `https://${host}/docs/${faker.string.uuid()}`
}

function mockFetchStatus(status: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response('', { status })))
  )
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

describe('G: BookmarkHostCheckController', { sequential: true }, () => {
  beforeEach(async () => {
    vi.unstubAllGlobals()
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

  test('host check requests use browser-like headers', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const result = await BookmarkHostCheckController.checkHost('https://headers.example')
    touchedHostKeys.add(result.hostKey)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://headers.example',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
          Accept: expect.stringContaining('text/html'),
          'Accept-Language': expect.stringContaining('zh-CN'),
        }),
      })
    )
  })

  test('host check falls back to GET when HEAD is not reachable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 403 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await BookmarkHostCheckController.checkHost('https://head-forbidden.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('reachable')
    expect(result.httpStatus).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://head-forbidden.example',
      expect.objectContaining({ method: 'HEAD' })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://head-forbidden.example',
      expect.objectContaining({ method: 'GET' })
    )
  })

  test('host check does not start GET after HEAD consumes the timeout budget', async () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(30_000)
    const fetchMock = vi.fn(() =>
      Promise.reject(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await BookmarkHostCheckController.checkHost('https://head-timeout.example', {
      timeout: 30_000,
    })
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('unreachable')
    expect(result.errorMessage).toBe('请求超时')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('4xx and 5xx responses are unreachable with chinese error message', async () => {
    mockFetchStatus(404)
    const result = await BookmarkHostCheckController.checkHost('https://missing.example')
    touchedHostKeys.add(result.hostKey)

    expect(result.status).toBe('unreachable')
    expect(result.httpStatus).toBe(404)
    expect(result.errorMessage).toBe('404：网页未找到')
  })

  test('network errors are unreachable without http status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })))
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
    const invalid = await db
      .insert(publicBookmarks)
      .values({ name: `${prefix}-null`, url: `https://${faker.string.uuid()}.example.com/null` })
      .returning()
    createdBookmarkIds.push(invalid[0].id)
    await db.update(publicBookmarks).set({ hostKey: null }).where(eq(publicBookmarks.id, invalid[0].id))
    first.hostKey && touchedHostKeys.add(first.hostKey)
    second.hostKey && touchedHostKeys.add(second.hostKey)

    const fetchMock = vi.fn(() => Promise.resolve(new Response('', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const result = await PublicBookmarkController.batchCheckHosts(
      findManyBookmarksSchema.parse({ keyword: prefix })
    )

    expect(result).toMatchObject({ total: 1, reachable: 1, unreachable: 0, skipped: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
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

    const fetchMock = vi.fn(() => Promise.resolve(new Response('', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

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
    expect(fetchMock).toHaveBeenCalledTimes(1)

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
    const fetchMock = vi.fn(() => Promise.resolve(new Response('', { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const task = await BookmarkHostCheckController.startPublicCheckHostsTask()

    expect(task).toEqual(runningTask)
    expect(fetchMock).not.toHaveBeenCalled()
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

  test('findMany can filter unchecked reachable and unreachable bookmarks', async () => {
    const prefix = createBookmarkName('filter-host')
    const unchecked = await createPublicBookmark({ name: `${prefix}-unchecked` })
    const reachable = await createPublicBookmark({ name: `${prefix}-reachable` })
    const unreachable = await createPublicBookmark({ name: `${prefix}-unreachable` })

    touchedHostKeys.add(reachable.hostKey!)
    touchedHostKeys.add(unreachable.hostKey!)
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
    ])

    const uncheckedResult = await PublicBookmarkController.findMany(
      findManyBookmarksSchema.parse({ keyword: prefix, hostCheckStatus: 'unchecked' })
    )
    const reachableResult = await PublicBookmarkController.findMany(
      findManyBookmarksSchema.parse({ keyword: prefix, hostCheckStatus: 'reachable' })
    )
    const unreachableResult = await PublicBookmarkController.findMany(
      findManyBookmarksSchema.parse({ keyword: prefix, hostCheckStatus: 'unreachable' })
    )

    expect(uncheckedResult.list.map((item) => item.id)).toEqual([unchecked.id])
    expect(reachableResult.list.map((item) => item.id)).toEqual([reachable.id])
    expect(reachableResult.list[0].hostCheckStatus).toBe('reachable')
    expect(unreachableResult.list.map((item) => item.id)).toEqual([unreachable.id])
    expect(unreachableResult.list[0].hostCheckErrorMessage).toBe('500：服务器内部错误')
  })
})
