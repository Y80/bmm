export interface FetchResponse {
  status: number
  headers: Record<string, string>
  body: Buffer
  effectiveUrl: string
}

/** 外部 HTTP 请求配置 */
export interface FetchRequestConfig {
  url: string
  method?: 'GET' | 'HEAD'
  /** 请求超时（毫秒），默认 10s */
  timeout?: number
  headers?: Record<string, string>
  /** URL 代理模板，含 {url} 占位符，如 https://proxy.com/fetch?url={url} */
  proxyUrl?: string
}

const HTML_HEADERS: Record<string, string> = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

const DEFAULT_TIMEOUT = 10_000

/** 将 URL 代理模板中的 {url} 替换为编码后的目标地址 */
export function applyUrlProxy(url: string, proxyUrl?: string | null): string {
  if (!proxyUrl) return url
  return proxyUrl.replace('{url}', encodeURIComponent(url))
}

function createFetchInit(config: FetchRequestConfig): RequestInit {
  return {
    method: config.method ?? 'GET',
    headers: config.headers,
    signal: AbortSignal.timeout(config.timeout ?? DEFAULT_TIMEOUT),
    redirect: 'follow',
  }
}

async function doFetch(config: FetchRequestConfig): Promise<FetchResponse> {
  const url = applyUrlProxy(config.url, config.proxyUrl)
  const response = await fetch(url, createFetchInit(config))
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body: Buffer.from(await response.arrayBuffer()),
    effectiveUrl: response.url,
  }
}

/** 通用外部 HTTP 请求 */
export async function fetchRequest(config: FetchRequestConfig): Promise<FetchResponse> {
  return doFetch(config)
}

/** HTML 页面专用请求，自动添加浏览器 Accept 头 */
export async function fetchHtmlRequest(config: FetchRequestConfig): Promise<FetchResponse> {
  return doFetch({
    ...config,
    headers: { ...HTML_HEADERS, ...config.headers },
  })
}

/** 按名称大小写不敏感查找 header */
export function getHeader(headers: Record<string, string>, name: string): string | null {
  return headers[name.toLowerCase()] ?? null
}

/** 判断是否为超时错误（TimeoutError / AbortError） */
export function isFetchTimeoutError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'TimeoutError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

/** 将网络错误转为用户可读的中文消息，非网络错误返回 null */
export function createFetchNetworkErrorMessage(error: unknown): string | null {
  if (isFetchTimeoutError(error)) return '请求超时'
  if (!(error instanceof Error)) return null

  const code = getErrorCode(error)
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return '域名解析失败'
  if (code.startsWith('CERT_') || code.includes('SSL') || code.includes('TLS')) return '证书错误'
  if (code === 'ECONNREFUSED') return '连接被拒绝'
  if (code === 'ETIMEDOUT') return '请求超时'

  return null
}

function getErrorCode(error: unknown): string {
  const cause = error instanceof Error && 'cause' in error ? (error as { cause?: unknown }).cause : null
  if (cause && typeof cause === 'object' && 'code' in cause) {
    return String((cause as { code?: unknown }).code || '')
  }
  return ''
}
