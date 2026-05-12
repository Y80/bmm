import { describe, expect, test, vi, beforeEach } from 'vitest'
import * as cuimpHttp from '@/utils/cuimp-http'
import fetchHtml from '@/utils/fetch-html'

vi.mock('@/utils/cuimp-http', async () => {
  const actual = await vi.importActual('@/utils/cuimp-http')
  return {
    ...actual,
    cuimpHtmlRequest: vi.fn(),
  }
})

function createHtmlResponse(body: Buffer, opts?: {
  status?: number
  headers?: Record<string, string>
  effectiveUrl?: string
}) {
  const { status = 200, headers = {}, effectiveUrl } = opts ?? {}
  return {
    status,
    statusText: 'OK',
    headers,
    rawBody: effectiveUrl ? Buffer.concat([body, Buffer.from(`\n__BMM_EFFECTIVE_URL__${effectiveUrl}`)]) : body,
    data: null,
    request: { url: 'https://example.com', method: 'GET' as const, headers: {}, command: '' },
    body,
    effectiveUrl: effectiveUrl || '',
  }
}

describe('fetchHtml', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('returns html and url on success', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockResolvedValue(
      createHtmlResponse(Buffer.from('<html><body>Hello</body></html>'))
    )

    const result = await fetchHtml('https://example.com')
    expect(result.html).toBe('<html><body>Hello</body></html>')
    expect(result.finalUrl).toBe('https://example.com')
  })

  test('captures effective url on redirect', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockResolvedValue(
      createHtmlResponse(Buffer.from('content'), { effectiveUrl: 'https://example.com/redirected' })
    )

    const result = await fetchHtml('https://example.com')
    expect(result.finalUrl).toBe('https://example.com/redirected')
  })

  test('retries on error', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest)
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue(createHtmlResponse(Buffer.from('success')))

    const result = await fetchHtml('https://example.com')
    expect(result.html).toBe('success')
    expect(cuimpHttp.cuimpHtmlRequest).toHaveBeenCalledTimes(3)
  })

  test('retries on non-2xx status', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest)
      .mockResolvedValueOnce(createHtmlResponse(Buffer.from(''), { status: 500 }))
      .mockResolvedValue(createHtmlResponse(Buffer.from('success')))

    const result = await fetchHtml('https://example.com')
    expect(result.html).toBe('success')
    expect(cuimpHttp.cuimpHtmlRequest).toHaveBeenCalledTimes(2)
  })

  test('throws after exhausting retries', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockRejectedValue(new Error('persistent error'))

    await expect(fetchHtml('https://example.com')).rejects.toThrow('获取 HTML 失败')
    expect(cuimpHttp.cuimpHtmlRequest).toHaveBeenCalledTimes(3)
  })

  test('throws timeout message on timeout error', async () => {
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockRejectedValue(
      new DOMException('timeout', 'TimeoutError')
    )

    await expect(fetchHtml('https://example.com')).rejects.toThrow('获取 HTML 超时')
  })

  test('throws on invalid URL', async () => {
    await expect(fetchHtml('not-a-url')).rejects.toThrow('无效的 URL')
  })

  test('decodes UTF-8 by default', async () => {
    const utf8Body = Buffer.from('<html><body>Hello World</body></html>', 'utf8')
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockResolvedValue(createHtmlResponse(utf8Body))

    const result = await fetchHtml('https://example.com')
    expect(result.html).toContain('Hello World')
  })

  test('decodes GB18030 when charset specified in header', async () => {
    const gbBody = Buffer.from([0xb2, 0xe2, 0xca, 0xd4])
    vi.mocked(cuimpHttp.cuimpHtmlRequest).mockResolvedValue(
      createHtmlResponse(gbBody, { headers: { 'content-type': 'text/html; charset=gb2312' } })
    )

    const result = await fetchHtml('https://example.com')
    expect(result.html).toBe('测试')
  })
})
