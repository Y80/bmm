export type BookmarkHostInfo = {
  protocol: 'http:' | 'https:'
  hostname: string
  port: string
  host: string
  origin: string
  hostKey: string
}

export function getBookmarkHost(url: string): BookmarkHostInfo | null {
  const candidate = url.trim()
  if (!URL.canParse(candidate)) return null

  const parsedUrl = new URL(candidate)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return null
  }

  return {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    host: parsedUrl.host,
    origin: parsedUrl.origin,
    hostKey: parsedUrl.origin,
  }
}
