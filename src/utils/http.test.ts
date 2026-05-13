import { describe, expect, test } from 'vitest'
import { getHeader, isFetchTimeoutError, createFetchNetworkErrorMessage, applyUrlProxy } from '@/utils/http'

describe('getHeader', () => {
  test('case-insensitive lookup', () => {
    const headers = { 'content-type': 'text/html', 'x-custom': 'value' }
    expect(getHeader(headers, 'Content-Type')).toBe('text/html')
    expect(getHeader(headers, 'CONTENT-TYPE')).toBe('text/html')
    expect(getHeader(headers, 'content-type')).toBe('text/html')
  })

  test('returns null for missing header', () => {
    const headers = { 'content-type': 'text/html' }
    expect(getHeader(headers, 'authorization')).toBeNull()
  })
})

describe('isFetchTimeoutError', () => {
  test('detects DOMException TimeoutError', () => {
    const err = new DOMException('timeout', 'TimeoutError')
    expect(isFetchTimeoutError(err)).toBe(true)
  })

  test('detects AbortError', () => {
    const err = new Error('aborted')
    err.name = 'AbortError'
    expect(isFetchTimeoutError(err)).toBe(true)
  })

  test('returns false for non-timeout errors', () => {
    expect(isFetchTimeoutError(new Error('normal error'))).toBe(false)
    expect(isFetchTimeoutError(null)).toBe(false)
    expect(isFetchTimeoutError(undefined)).toBe(false)
    expect(isFetchTimeoutError('string')).toBe(false)
  })
})

describe('createFetchNetworkErrorMessage', () => {
  test('timeout error', () => {
    const err = new DOMException('timeout', 'TimeoutError')
    expect(createFetchNetworkErrorMessage(err)).toBe('请求超时')
  })

  test('DNS resolution failure', () => {
    const err = Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
    expect(createFetchNetworkErrorMessage(err)).toBe('域名解析失败')
  })

  test('connection refused', () => {
    const err = Object.assign(new Error('fetch failed'), { cause: { code: 'ECONNREFUSED' } })
    expect(createFetchNetworkErrorMessage(err)).toBe('连接被拒绝')
  })

  test('SSL errors', () => {
    const err1 = Object.assign(new Error('fetch failed'), { cause: { code: 'CERT_HAS_EXPIRED' } })
    expect(createFetchNetworkErrorMessage(err1)).toBe('证书错误')

    const err2 = Object.assign(new Error('fetch failed'), { cause: { code: 'ERR_SSL_WRONG_VERSION_NUMBER' } })
    expect(createFetchNetworkErrorMessage(err2)).toBe('证书错误')
  })

  test('ETIMEDOUT', () => {
    const err = Object.assign(new Error('fetch failed'), { cause: { code: 'ETIMEDOUT' } })
    expect(createFetchNetworkErrorMessage(err)).toBe('请求超时')
  })

  test('non-fetch error returns null', () => {
    expect(createFetchNetworkErrorMessage(new Error('random'))).toBeNull()
    expect(createFetchNetworkErrorMessage(null)).toBeNull()
  })
})

describe('applyUrlProxy', () => {
  test('returns original url when proxy is empty', () => {
    expect(applyUrlProxy('https://example.com', '')).toBe('https://example.com')
    expect(applyUrlProxy('https://example.com', null)).toBe('https://example.com')
    expect(applyUrlProxy('https://example.com', undefined)).toBe('https://example.com')
  })

  test('replaces {url} placeholder with encoded url', () => {
    const proxy = 'https://proxy.com/fetch?url={url}'
    expect(applyUrlProxy('https://example.com/path', proxy)).toBe(
      'https://proxy.com/fetch?url=' + encodeURIComponent('https://example.com/path')
    )
  })
})
