import { describe, expect, test } from 'vitest'
import { getCuimpHeader, isCuimpTimeoutError, createCuimpNetworkErrorMessage } from '@/utils/cuimp-http'
import { CurlError, CurlExitCode } from 'cuimp'

describe('getCuimpHeader', () => {
  test('case-insensitive lookup', () => {
    const headers = { 'content-type': 'text/html', 'X-Custom': 'value' }
    expect(getCuimpHeader(headers, 'Content-Type')).toBe('text/html')
    expect(getCuimpHeader(headers, 'CONTENT-TYPE')).toBe('text/html')
    expect(getCuimpHeader(headers, 'content-type')).toBe('text/html')
  })

  test('returns null for missing header', () => {
    const headers = { 'content-type': 'text/html' }
    expect(getCuimpHeader(headers, 'authorization')).toBeNull()
  })
})

describe('isCuimpTimeoutError', () => {
  test('detects DOMException TimeoutError', () => {
    const err = new DOMException('timeout', 'TimeoutError')
    expect(isCuimpTimeoutError(err)).toBe(true)
  })

  test('detects AbortError', () => {
    const err = new Error('aborted')
    err.name = 'AbortError'
    expect(isCuimpTimeoutError(err)).toBe(true)
  })

  test('detects CurlError OPERATION_TIMEDOUT', () => {
    const err = new CurlError(CurlExitCode.OPERATION_TIMEDOUT, '', 'timeout')
    expect(isCuimpTimeoutError(err)).toBe(true)
  })

  test('returns false for non-timeout errors', () => {
    expect(isCuimpTimeoutError(new Error('normal error'))).toBe(false)
    expect(isCuimpTimeoutError(null)).toBe(false)
    expect(isCuimpTimeoutError(undefined)).toBe(false)
    expect(isCuimpTimeoutError('string')).toBe(false)
  })
})

describe('createCuimpNetworkErrorMessage', () => {
  test('timeout error', () => {
    const err = new CurlError(CurlExitCode.OPERATION_TIMEDOUT, '', 'timeout')
    expect(createCuimpNetworkErrorMessage(err)).toBe('请求超时')
  })

  test('DNS resolution failure', () => {
    const err = new CurlError(CurlExitCode.COULDNT_RESOLVE_HOST, '', 'dns')
    expect(createCuimpNetworkErrorMessage(err)).toBe('域名解析失败')
  })

  test('connection refused', () => {
    const err = new CurlError(CurlExitCode.COULDNT_CONNECT, '', 'connect')
    expect(createCuimpNetworkErrorMessage(err)).toBe('连接被拒绝')
  })

  test('SSL errors', () => {
    expect(createCuimpNetworkErrorMessage(new CurlError(CurlExitCode.SSL_CONNECT_ERROR))).toBe('证书错误')
    expect(createCuimpNetworkErrorMessage(new CurlError(CurlExitCode.SSL_CERTPROBLEM))).toBe('证书错误')
    expect(createCuimpNetworkErrorMessage(new CurlError(CurlExitCode.PEER_FAILED_VERIFICATION))).toBe('证书错误')
  })

  test('non-curl error returns null', () => {
    expect(createCuimpNetworkErrorMessage(new Error('random'))).toBeNull()
    expect(createCuimpNetworkErrorMessage(null)).toBeNull()
  })
})
