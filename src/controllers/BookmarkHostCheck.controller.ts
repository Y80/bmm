import { db, schema } from '@/db'
import { createBrowserHeaders } from '@/utils/browser-request'
import { getBookmarkHost } from '@/utils/bookmark-host'
import { and, eq, inArray, isNull, notInArray, or } from 'drizzle-orm'

const { bookmarkHostChecks, publicBookmarks, siteConfigs, userBookmarks, userConfigs } = schema

export type BookmarkHostCheckStatus = 'reachable' | 'unreachable'
export type BookmarkHostCheckFilterStatus = BookmarkHostCheckStatus | 'unchecked' | 'all'
export type CheckHostsTaskValue = {
  startedAt: string
  finishedAt: string | null
  total: number
  checked: number
  errorMessage?: string | null
}

export type BookmarkHostCheckSummary = {
  hostCheckStatus?: BookmarkHostCheckStatus | 'unchecked'
  hostCheckedAt?: Date | null
  hostCheckHttpStatus?: number | null
  hostCheckErrorMessage?: string | null
}

type BookmarkWithHostKey = {
  hostKey?: string | null
}

type CheckHostResult = typeof bookmarkHostChecks.$inferSelect
type SaveCheckHostsTask = (task: CheckHostsTaskValue) => Promise<CheckHostsTaskValue>

export const CHECK_HOSTS_TASK_KEY = 'checkHostsTask'
export const CHECK_HOST_TIMEOUT = 30 * 1000
export const CHECK_HOST_CONCURRENCY = 5
const HOST_CHECK_FRESH_MS = 24 * 60 * 60 * 1000

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '请求错误',
  401: '需要登录',
  403: '访问被拒绝',
  404: '网页未找到',
  408: '请求超时',
  429: '请求过于频繁',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关超时',
}

export function getBookmarkHostKey(url: string) {
  return getBookmarkHost(url)?.hostKey ?? null
}

export function createBookmarkHostCheckFilter(
  table: { hostKey: any },
  status: BookmarkHostCheckFilterStatus
) {
  if (status === 'all') return undefined

  const checkedHostKeys = db.select({ hostKey: bookmarkHostChecks.hostKey }).from(bookmarkHostChecks)

  if (status === 'unchecked') {
    return or(isNull(table.hostKey), notInArray(table.hostKey, checkedHostKeys))
  }

  const targetHostKeys = db
    .select({ hostKey: bookmarkHostChecks.hostKey })
    .from(bookmarkHostChecks)
    .where(eq(bookmarkHostChecks.status, status))
  return and(inArray(table.hostKey, targetHostKeys))
}

export async function withBookmarkHostCheckSummaries<T extends BookmarkWithHostKey>(
  list: T[]
): Promise<Array<T & BookmarkHostCheckSummary>> {
  const hostKeys = [...new Set(list.map((item) => item.hostKey).filter(Boolean))] as string[]
  if (!hostKeys.length) {
    return list.map((item) => appendHostCheckSummary(item, null))
  }

  const checks = await db
    .select()
    .from(bookmarkHostChecks)
    .where(inArray(bookmarkHostChecks.hostKey, hostKeys))
  const checkMap = new Map(checks.map((item) => [item.hostKey, item]))

  return list.map((item) => appendHostCheckSummary(item, item.hostKey ? checkMap.get(item.hostKey) : null))
}

function appendHostCheckSummary<T extends BookmarkWithHostKey>(
  item: T,
  check: CheckHostResult | null | undefined
): T & BookmarkHostCheckSummary {
  return {
    ...item,
    hostCheckStatus: (check?.status ?? 'unchecked') as BookmarkHostCheckSummary['hostCheckStatus'],
    hostCheckedAt: check?.checkedAt ?? null,
    hostCheckHttpStatus: check?.httpStatus ?? null,
    hostCheckErrorMessage: check?.errorMessage ?? null,
  }
}

async function requestHost(hostKey: string, method: 'HEAD' | 'GET', timeout: number) {
  if (timeout <= 0) {
    throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
  }

  return await fetch(hostKey, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
    headers: createBrowserHeaders(),
  })
}

async function probeHost(hostKey: string, timeout: number) {
  const startedAt = Date.now()
  const getRemainingTimeout = () => timeout - (Date.now() - startedAt)

  try {
    const headResponse = await requestHost(hostKey, 'HEAD', getRemainingTimeout())
    if (headResponse.status >= 200 && headResponse.status < 400) {
      return headResponse
    }
  } catch {
    // 部分站点拒绝 HEAD，请求失败时再用 GET 确认一次。
  }

  return await requestHost(hostKey, 'GET', getRemainingTimeout())
}

function createHttpErrorMessage(status: number) {
  return `${status}：${HTTP_ERROR_MESSAGES[status] || 'HTTP 请求失败'}`
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') return ''
  const cause = 'cause' in error ? (error as { cause?: unknown }).cause : null
  if (cause && typeof cause === 'object' && 'code' in cause) {
    return String((cause as { code?: unknown }).code || '')
  }
  return ''
}

function createNetworkErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'TimeoutError') return '请求超时'
  if (error instanceof Error && error.name === 'AbortError') return '请求超时'

  const code = getErrorCode(error)
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return '域名解析失败'
  if (code.startsWith('CERT_') || code.includes('SSL') || code.includes('TLS')) return '证书错误'
  if (code === 'ECONNREFUSED') return '连接被拒绝'
  if (code === 'ETIMEDOUT') return '请求超时'

  return '网络请求失败'
}

async function saveCheckResult(input: {
  hostKey: string
  status: BookmarkHostCheckStatus
  httpStatus: number | null
  errorMessage: string | null
}) {
  const now = new Date()
  const values = {
    ...input,
    checkedAt: now,
    updatedAt: now,
  }
  const updateValues = {
    status: values.status,
    httpStatus: values.httpStatus,
    errorMessage: values.errorMessage,
    checkedAt: values.checkedAt,
    updatedAt: values.updatedAt,
  }
  const rows = await db
    .insert(bookmarkHostChecks)
    .values(values)
    .onConflictDoUpdate({
      target: bookmarkHostChecks.hostKey,
      set: updateValues,
    })
    .returning()
  return rows[0]
}

function parseCheckHostsTaskValue(value: unknown): CheckHostsTaskValue | null {
  if (!value || typeof value !== 'object') return null
  const task = value as Partial<CheckHostsTaskValue>
  if (
    typeof task.startedAt !== 'string' ||
    !(typeof task.finishedAt === 'string' || task.finishedAt === null) ||
    typeof task.total !== 'number' ||
    typeof task.checked !== 'number'
  ) {
    return null
  }

  return {
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    total: task.total,
    checked: task.checked,
    errorMessage: typeof task.errorMessage === 'string' ? task.errorMessage : null,
  }
}

async function getPublicCheckHostsTask() {
  const row = await db.query.siteConfigs.findFirst({
    where: eq(siteConfigs.key, CHECK_HOSTS_TASK_KEY),
  })
  return parseCheckHostsTaskValue(row?.value)
}

async function getUserCheckHostsTask(userId: UserId) {
  const row = await db.query.userConfigs.findFirst({
    where: and(eq(userConfigs.userId, userId), eq(userConfigs.key, CHECK_HOSTS_TASK_KEY)),
  })
  return parseCheckHostsTaskValue(row?.value)
}

async function savePublicCheckHostsTask(task: CheckHostsTaskValue) {
  const value = task as typeof siteConfigs.$inferInsert.value
  await db
    .insert(siteConfigs)
    .values({
      key: CHECK_HOSTS_TASK_KEY,
      value,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteConfigs.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    })
  return task
}

async function saveUserCheckHostsTask(userId: UserId, task: CheckHostsTaskValue) {
  const value = task as typeof userConfigs.$inferInsert.value
  await db
    .insert(userConfigs)
    .values({
      userId,
      key: CHECK_HOSTS_TASK_KEY,
      value,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userConfigs.userId, userConfigs.key],
      set: {
        value,
        updatedAt: new Date(),
      },
    })
  return task
}

async function getPublicBookmarkHostKeys() {
  return await db.select({ hostKey: publicBookmarks.hostKey }).from(publicBookmarks)
}

async function getUserBookmarkHostKeys(userId: UserId) {
  return await db
    .select({ hostKey: userBookmarks.hostKey })
    .from(userBookmarks)
    .where(eq(userBookmarks.userId, userId))
}

async function filterPendingHostKeys(hostKeys: Array<string | null | undefined>) {
  const uniqueHostKeys = [...new Set(hostKeys.filter(Boolean))] as string[]
  if (!uniqueHostKeys.length) return []

  const checkedRows = await db
    .select({
      hostKey: bookmarkHostChecks.hostKey,
      checkedAt: bookmarkHostChecks.checkedAt,
    })
    .from(bookmarkHostChecks)
    .where(inArray(bookmarkHostChecks.hostKey, uniqueHostKeys))
  const freshAfter = Date.now() - HOST_CHECK_FRESH_MS
  const freshHostKeys = new Set(
    checkedRows
      .filter((item) => item.checkedAt.getTime() >= freshAfter)
      .map((item) => item.hostKey)
  )

  return uniqueHostKeys.filter((hostKey) => !freshHostKeys.has(hostKey))
}

async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  let nextIndex = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex]
      nextIndex += 1
      await worker(item)
    }
  })
  await Promise.all(runners)
}

async function executeCheckHostsTask(input: {
  hostKeys: string[]
  initialTask: CheckHostsTaskValue
  saveTask: SaveCheckHostsTask
}) {
  const { hostKeys, initialTask, saveTask } = input
  let checked = initialTask.checked

  try {
    await runConcurrent(hostKeys, CHECK_HOST_CONCURRENCY, async (hostKey) => {
      try {
        await BookmarkHostCheckController.checkHost(hostKey, { timeout: CHECK_HOST_TIMEOUT })
      } catch {
        // 单个 Host 的异常不应让整批任务卡住；可解析 Host 的网络失败会在 checkHost 内落库。
      }
      checked += 1
      await saveTask({
        ...initialTask,
        checked,
      })
    })
    await saveTask({
      ...initialTask,
      checked,
      finishedAt: new Date().toISOString(),
    })
  } catch (error) {
    await saveTask({
      ...initialTask,
      checked,
      finishedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : '检测任务执行失败',
    })
  }
}

async function startCheckHostsTask(input: {
  getRunningTask: () => Promise<CheckHostsTaskValue | null>
  getHostKeys: () => Promise<Array<{ hostKey: string | null }>>
  saveTask: SaveCheckHostsTask
}) {
  const runningTask = await input.getRunningTask()
  if (runningTask && runningTask.finishedAt === null) return runningTask

  const rows = await input.getHostKeys()
  const hostKeys = await filterPendingHostKeys(rows.map((item) => item.hostKey))
  const now = new Date().toISOString()
  const initialTask: CheckHostsTaskValue = {
    startedAt: now,
    finishedAt: hostKeys.length ? null : now,
    total: hostKeys.length,
    checked: 0,
    errorMessage: null,
  }

  await input.saveTask(initialTask)
  if (hostKeys.length) {
    void executeCheckHostsTask({
      hostKeys,
      initialTask,
      saveTask: input.saveTask,
    })
  }

  return initialTask
}

const BookmarkHostCheckController = {
  async checkHost(hostKey: string, opts: { timeout?: number } = {}) {
    const normalizedHostKey = getBookmarkHostKey(hostKey)
    if (!normalizedHostKey || normalizedHostKey !== hostKey) {
      throw new Error('无法检测无效的网站 Host')
    }

    try {
      const response = await probeHost(hostKey, opts.timeout || 8000)
      const reachable = response.status >= 200 && response.status < 400
      return await saveCheckResult({
        hostKey,
        status: reachable ? 'reachable' : 'unreachable',
        httpStatus: response.status,
        errorMessage: reachable ? null : createHttpErrorMessage(response.status),
      })
    } catch (error) {
      return await saveCheckResult({
        hostKey,
        status: 'unreachable',
        httpStatus: null,
        errorMessage: createNetworkErrorMessage(error),
      })
    }
  },

  async checkHosts(hostKeys: Array<string | null | undefined>, opts: { timeout?: number } = {}) {
    const normalizedHostKeys = [...new Set(hostKeys.filter(Boolean))] as string[]
    const result = {
      total: normalizedHostKeys.length,
      reachable: 0,
      unreachable: 0,
      skipped: hostKeys.filter((hostKey) => !hostKey).length,
    }

    for (const hostKey of normalizedHostKeys) {
      const row = await this.checkHost(hostKey, opts)
      result[row.status as BookmarkHostCheckStatus] += 1
    }

    return result
  },

  async getPublicCheckHostsTask() {
    return await getPublicCheckHostsTask()
  },

  async getUserCheckHostsTask(userId: UserId) {
    return await getUserCheckHostsTask(userId)
  },

  async startPublicCheckHostsTask() {
    return await startCheckHostsTask({
      getRunningTask: getPublicCheckHostsTask,
      getHostKeys: getPublicBookmarkHostKeys,
      saveTask: savePublicCheckHostsTask,
    })
  },

  async startUserCheckHostsTask(userId: UserId) {
    return await startCheckHostsTask({
      getRunningTask: () => getUserCheckHostsTask(userId),
      getHostKeys: () => getUserBookmarkHostKeys(userId),
      saveTask: (task) => saveUserCheckHostsTask(userId, task),
    })
  },
}

export default BookmarkHostCheckController
