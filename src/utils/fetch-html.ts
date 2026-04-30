import iconv from 'iconv-lite'
import { isValidUrl, to } from '.'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
}

interface FetchHtmlOptions {
  timeout?: number // ms，默认 15000
  retries?: number // 默认 2
  userAgent?: string
}

/** 抓取网页 HTML，自动重试、跟随重定向、多编码解码 */
export default async function fetchHtml(url: string, options: FetchHtmlOptions = {}) {
  if (!isValidUrl(url)) throw new Error('无效的 URL')

  const timeout = options.timeout ?? 15_000
  const retries = options.retries ?? 2

  const headers = { ...BROWSER_HEADERS }
  if (options.userAgent) headers['User-Agent'] = options.userAgent

  let lastErr: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    const [err, res] = await to(
      fetch(url, { headers, signal: AbortSignal.timeout(timeout), redirect: 'follow' })
    )

    if (err) {
      lastErr = err
      continue
    }

    if (!res.ok) {
      lastErr = new Error(`HTTP ${res.status}`)
      continue
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    return {
      html: decodeHtml(buffer, res.headers.get('content-type')),
      url: res.url, // 重定向后的最终 URL
    }
  }

  const isTimeout = lastErr?.name === 'TimeoutError' || lastErr?.name === 'AbortError'
  throw new Error(isTimeout ? '获取 HTML 超时' : '获取 HTML 失败')
}

// --- 字符解码 ---

/** 解码优先级: HTTP header charset → UTF-8 BOM → <meta> charset → GB 特征检测 → UTF-8 */
function decodeHtml(buffer: Buffer, contentType: string | null) {
  const headerCharset = parseCharset(contentType)
  if (headerCharset) return iconv.decode(buffer, headerCharset)

  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.toString('utf8')
  }

  const head = buffer.toString('utf8', 0, Math.min(buffer.length, 4096))
  const metaCharset = parseMetaCharset(head)
  if (metaCharset && metaCharset !== 'utf8') return iconv.decode(buffer, metaCharset)

  if (detectGbEncoding(buffer)) return iconv.decode(buffer, 'gb18030')

  return buffer.toString('utf8')
}

/** 从 Content-Type header 提取 charset 并映射到 iconv 编码名 */
function parseCharset(contentType: string | null): string | null {
  if (!contentType) return null
  const match = contentType.match(/charset=([^;\s]+)/i)
  if (!match) return null
  return normalizeCharset(match[1])
}

/** 从 HTML <meta> 标签提取 charset */
function parseMetaCharset(html: string): string | null {
  // <meta charset="utf-8">
  const m = html.match(/<meta\s+charset\s*=\s*["']?([^"'\s>]+)/i)
  if (m) return normalizeCharset(m[1])

  // <meta http-equiv="Content-Type" content="...; charset=gbk">
  const m2 = html.match(/<meta[^>]+content\s*=\s*["'][^"']*charset\s*=\s*([^"'\s>]+)/i)
  if (m2) return normalizeCharset(m2[1])

  return null
}

/** 将常见编码名映射为 iconv-lite 支持的名称 */
function normalizeCharset(raw: string): string | null {
  const name = raw.toLowerCase().replace(/[-_]/g, '')
  if (name === 'utf8' || name === 'utf-8') return 'utf8'
  if (name === 'gb2312' || name === 'gbk' || name === 'gb18030') return 'gb18030'
  if (name === 'big5' || name === 'big5hkscs') return 'big5'
  if (name === 'shiftjis' || name === 'sjis') return 'shift_jis'
  if (name === 'euckr' || name === 'ksc56011987') return 'euc-kr'
  if (name === 'latin1' || name === 'iso88591' || name === 'windows1252') return 'windows-1252'
  if (name === 'cp1251' || name === 'windows1251') return 'windows-1251'
  return null
}

/** 通过字节特征检测 GB 系列编码：高字节 0xB0-0xF7 + 低字节 0xA1-0xFE */
function detectGbEncoding(buffer: Buffer): boolean {
  let count = 0
  for (let i = 0; i < Math.min(buffer.length - 1, 8192); i++) {
    if (buffer[i] >= 0xb0 && buffer[i] <= 0xf7 && buffer[i + 1] >= 0xa1 && buffer[i + 1] <= 0xfe) {
      count++
      i++
    }
  }
  return count > 2
}
