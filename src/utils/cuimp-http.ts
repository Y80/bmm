import {
  CurlError,
  CurlExitCode,
  request,
  type CuimpRequestConfig,
  type CuimpResponse,
} from 'cuimp'

/** 通过 curl --write-out 将重定向后的最终 URL 附加到响应体末尾的标记 */
const CUIMP_EFFECTIVE_URL_MARKER = '\n__BMM_EFFECTIVE_URL__'

export type { CuimpRequestConfig, CuimpResponse } from 'cuimp'

/** 附带重定向最终 URL 的 cuimp 响应 */
export type CuimpResponseWithEffectiveUrl<T = unknown> = CuimpResponse<T> & {
  body: Buffer
  effectiveUrl: string
}

const DEFAULT_EXTRA_CURL_ARGS = ['--compressed', '--connect-timeout', '10']
const HTML_HEADERS: Record<string, string> = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

/**
 * 通用 cuimp 请求，自动添加 --compressed 参数
 * method 可选，默认为 GET
 */
export async function cuimpRequest<T = unknown>(config: CuimpRequestConfig) {
  return await request<T>(createCuimpConfig(config))
}

/**
 * HTML 页面专用请求，自动添加浏览器 Accept 头
 * captureEffectiveUrl: true 时返回重定向后的最终 URL
 */
export async function cuimpHtmlRequest(
  config: CuimpRequestConfig & { captureEffectiveUrl: true }
): Promise<CuimpResponseWithEffectiveUrl>
export async function cuimpHtmlRequest(
  config: CuimpRequestConfig & { captureEffectiveUrl?: false }
): Promise<CuimpResponse>
export async function cuimpHtmlRequest(
  config: CuimpRequestConfig & { captureEffectiveUrl?: boolean }
): Promise<CuimpResponse | CuimpResponseWithEffectiveUrl> {
  const response = await request(createCuimpConfig(config, HTML_HEADERS))
  if (!config.captureEffectiveUrl) return response

  const { body, effectiveUrl } = splitEffectiveUrl(response.rawBody)
  return {
    ...response,
    body,
    effectiveUrl,
  } satisfies CuimpResponseWithEffectiveUrl
}

/** cuimp 返回的 headers key 全部为小写，此函数按原始名称大小写不敏感查找 */
export function getCuimpHeader(headers: Record<string, string>, name: string) {
  return headers[name.toLowerCase()] ?? null
}

/**
 * 判断是否为超时错误
 * 覆盖 DOMException TimeoutError、AbortError、curl OPERATION_TIMEDOUT 三种情况
 */
export function isCuimpTimeoutError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'TimeoutError') ||
    (error instanceof Error && error.name === 'AbortError') ||
    (error instanceof CurlError && error.code === CurlExitCode.OPERATION_TIMEDOUT)
  )
}

/**
 * 将 curl 网络错误转为用户可读的中文消息
 * 覆盖：超时、DNS 失败、连接拒绝、证书错误
 * 非 curl 错误或非已知错误码返回 null
 */
export function createCuimpNetworkErrorMessage(error: unknown) {
  if (isCuimpTimeoutError(error)) return '请求超时'
  if (!(error instanceof CurlError)) return null

  if (error.code === CurlExitCode.COULDNT_RESOLVE_HOST) return '域名解析失败'
  if (error.code === CurlExitCode.COULDNT_CONNECT) return '连接被拒绝'
  if (
    error.code === CurlExitCode.SSL_CONNECT_ERROR ||
    error.code === CurlExitCode.SSL_CERTPROBLEM ||
    error.code === CurlExitCode.PEER_FAILED_VERIFICATION ||
    error.code === CurlExitCode.SSL_CACERT_BADFILE ||
    error.code === CurlExitCode.SSL_ISSUER_ERROR
  ) {
    return '证书错误'
  }

  return null
}

/** 构建 cuimp 请求配置，合并默认 curl 参数和 header */
function createCuimpConfig(config: CuimpRequestConfig & { captureEffectiveUrl?: boolean }, headers?: Record<string, string>) {
  const { captureEffectiveUrl, ...requestConfig } = config
  const extraCurlArgs = [...DEFAULT_EXTRA_CURL_ARGS, ...(config.extraCurlArgs ?? [])]
  if (captureEffectiveUrl) {
    extraCurlArgs.push('--write-out', `${CUIMP_EFFECTIVE_URL_MARKER}%{url_effective}`)
  }

  return {
    ...requestConfig,
    headers: {
      ...headers,
      ...requestConfig.headers,
    },
    extraCurlArgs,
  }
}

/**
 * 从 rawBody 中分离通过 --write-out 追加的 effective URL
 * 标记格式：\n__BMM_EFFECTIVE_URL__{url_effective}
 */
function splitEffectiveUrl(rawBody: Buffer) {
  const marker = Buffer.from(CUIMP_EFFECTIVE_URL_MARKER)
  const markerIndex = rawBody.lastIndexOf(marker)
  if (markerIndex < 0) return { body: rawBody, effectiveUrl: '' }

  return {
    body: rawBody.subarray(0, markerIndex),
    effectiveUrl: rawBody.subarray(markerIndex + marker.length).toString('utf8').trim(),
  }
}
