import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

const MIN_CONTENT_LENGTH = 200

function createFallbackArticle(url: string) {
  return {
    title: url,
    summary: '暂时无法获取页面内容，请稍后重试，或手动补充标题、图标与摘要。',
    estimatedReadingMinutes: 1,
  }
}

function normalizeText(text = '') {
  return text.replace(/\s+/g, ' ').trim()
}

function estimateReadingMinutes(text: string) {
  const length = normalizeText(text).length
  if (!length) return 1
  return Math.max(1, Math.min(60, Math.ceil(length / 350)))
}

/** 将相对 URL 转为绝对 URL */
function absolutifyUrls(html: string, baseUrl: string) {
  const url = new URL(baseUrl)
  const base = `${url.protocol}//${url.host}`

  return html
    .replace(
      /(<(?:img|source|link)[^>]+(?:src|href)\s*=\s*["'])(\/\/[^"']+)(["'])/gi,
      `$1${url.protocol}$2$3`
    )
    .replace(
      /(<(?:img|source|link)[^>]+(?:src|href)\s*=\s*["'])(\/[^"']+)(["'])/gi,
      `$1${base}$2$3`
    )
    .replace(
      /(<(?:img|source|link)[^>]+(?:src|href)\s*=\s*["'])([^/][^"':]*)(["'])/gi,
      (match, prefix, relative, suffix) => {
        if (
          relative.startsWith('http://') ||
          relative.startsWith('https://') ||
          relative.startsWith('data:')
        ) {
          return match
        }
        return `${prefix}${new URL(relative, baseUrl).href}${suffix}`
      }
    )
}

/** 用 Readability 解析 HTML，返回文章对象或 null */
function parseWithReadability(html: string, url: string) {
  const { document } = parseHTML(absolutifyUrls(html, url))
  return new Readability(document).parse()
}

/** 从 __NEXT_DATA__ JSON 中递归寻找最长的文章 HTML 字符串和标题
 *
 * Next.js 会在 HTML 中注入 <script id="__NEXT_DATA__">，包含服务端获取的全部 props 数据。
 * 对于 CSR 页面（如 mdnice），正文内容不在 DOM 中（只有空的 <div id="__next">），而是存在这个 JSON 里，
 * 客户端 JS 读取后再渲染。所以 Readability 解析 DOM 失败时需要回退到这里提取正文。
 */
function findArticleContentInNextData(obj: unknown): { html: string; title: string } {
  let bestHtml = ''
  let bestTitle = ''

  function walk(node: unknown) {
    if (typeof node === 'string') {
      if (node.length > bestHtml.length && /<(?:p|h[1-6]|article|section)[>\s]/i.test(node)) {
        bestHtml = node
      }
    }
    if (typeof node === 'object' && node !== null) {
      if (Array.isArray(node)) {
        for (const item of node) walk(item)
      } else {
        const entries = Object.entries(node as Record<string, unknown>)
        // 如果对象包含 html 或 content 字段，同级的 title 字段可能是文章标题
        const hasHtmlContent = entries.some(
          ([key]) => key === 'html' || key === 'content' || key === 'markdown'
        )
        for (const [key, value] of entries) {
          if (
            hasHtmlContent &&
            key === 'title' &&
            typeof value === 'string' &&
            value.length > 3 &&
            value.length < 200
          ) {
            bestTitle = value
          }
          walk(value)
        }
      }
    }
  }

  walk(obj)
  return { html: bestHtml, title: bestTitle }
}

/** 使用 Readability 从 HTML 提取文章标题、摘要和阅读时间 */
export function extractArticleFromHtml(html: string, url: string) {
  const fallback = createFallbackArticle(url)

  if (!html || html.length < 100) return fallback

  let article = parseWithReadability(html, url)

  // Readability 提取失败时，尝试从 __NEXT_DATA__ 中获取文章正文 HTML
  if (!article?.textContent || article.textContent.length < MIN_CONTENT_LENGTH) {
    const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1])
        const { html: articleHtml, title: nextDataTitle } = findArticleContentInNextData(nextData)
        if (articleHtml.length > MIN_CONTENT_LENGTH) {
          const titleTag = nextDataTitle ? `<title>${nextDataTitle}</title>` : ''
          const fullHtml = `<html><head>${titleTag}</head><body>${articleHtml}</body></html>`
          article = parseWithReadability(fullHtml, url)
        }
      } catch {
        /* ignore JSON parse errors */
      }
    }
  }

  if (!article?.textContent || article.textContent.length < MIN_CONTENT_LENGTH) {
    return fallback
  }

  const title =
    normalizeText(article.title ?? '') || normalizeText(article.siteName ?? '') || fallback.title
  const excerpt = normalizeText(article.excerpt ?? '') || ''
  const summary =
    excerpt.slice(0, 160) || normalizeText(article.textContent).slice(0, 160) || fallback.summary

  return {
    title,
    summary,
    estimatedReadingMinutes: estimateReadingMinutes(article.textContent),
  }
}
