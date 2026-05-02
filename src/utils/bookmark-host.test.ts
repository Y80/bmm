import { describe, expect, it } from 'vitest'
import { getBookmarkHost } from './bookmark-host'

describe('getBookmarkHost', () => {
  it('should extract origin from a full URL', () => {
    expect(getBookmarkHost('https://example.com/articles/1?from=bmm#title')).toMatchObject({
      protocol: 'https:',
      hostname: 'example.com',
      port: '',
      host: 'example.com',
      origin: 'https://example.com',
      hostKey: 'https://example.com',
    })
  })

  it('should keep http and https as different hosts', () => {
    expect(getBookmarkHost('http://example.com/a')?.hostKey).toBe('http://example.com')
    expect(getBookmarkHost('https://example.com/a')?.hostKey).toBe('https://example.com')
  })

  it('should normalize hostname case and remove default ports', () => {
    expect(getBookmarkHost('HTTPS://Example.COM:443/docs')?.hostKey).toBe('https://example.com')
    expect(getBookmarkHost('http://Example.COM:80/docs')?.hostKey).toBe('http://example.com')
  })

  it('should keep non-default ports', () => {
    expect(getBookmarkHost('https://example.com:8443/docs')?.hostKey).toBe(
      'https://example.com:8443'
    )
  })

  it('should ignore username, password, path, query, and hash', () => {
    expect(getBookmarkHost('https://user:pass@example.com/path?a=1#hash')?.hostKey).toBe(
      'https://example.com'
    )
  })

  it('should return null for invalid or unsupported URLs', () => {
    expect(getBookmarkHost('example.com')).toBeNull()
    expect(getBookmarkHost('not a url')).toBeNull()
    expect(getBookmarkHost('mailto:hello@example.com')).toBeNull()
    expect(getBookmarkHost('ftp://example.com/file.zip')).toBeNull()
  })
})
