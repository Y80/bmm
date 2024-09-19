import { z } from '@/lib/zod'
import fetchHtml from '@/utils/fetch-html'

async function parseWebsite(inputUrl: string) {
  const { html, url } = await fetchHtml(new URL(inputUrl).origin)
  const rst = parseHtml(html, url)
  if (!rst.icon) {
    // 尝试请求 /favicon.ico
    const rsp = await fetch(url + '/favicon.ico', { method: 'HEAD' })
    if (rsp.status === 200) {
      rst.icon = url + '/favicon.ico'
    }
  }

  return rst
}

/**
 * 解析 HTML，获取 title、icon、description
 * 不支持非 UTF8 字符集如 GB2312
 */
function parseHtml(html: string, origin: string) {
  const rst = { title: '', description: '', icon: '' }
  const metaTagsMatcher = html.match(/<meta[\s\S]+?>/gi)
  if (metaTagsMatcher) {
    for (const meta of metaTagsMatcher) {
      if (/name=.?description.?/i.test(meta)) {
        rst.description = /(?<=content=['"])[\s\S]+?(?=['"])/.exec(meta)?.at(0) || ''
        break
      }
    }
  }
  const titleMatcher = /(?<=<title.*?>)[\s\S]+?(?=<\/title>)/gi.exec(html)
  if (titleMatcher) {
    rst.title = titleMatcher[0].trim()
  }
  const linkTagMatcher = html.match(/<link[\s\S]+?>/g)
  if (linkTagMatcher) {
    for (const link of linkTagMatcher) {
      if (/(\srel=.?shortcut)|(\srel=.?icon)/gi.test(link)) {
        const hrefMatcher = link.match(/(?<=href=")[\s\S]+?(?=")/i)
        if (hrefMatcher) {
          const href = hrefMatcher[0]
          rst.icon = new URL(href, origin).href
          break
        }
      }
    }
  }

  return rst
}

export async function handleParseWebsite(req: Request) {
  const schema = z.object({ url: z.string().url() })
  const res = schema.parse(await req.json())
  return await parseWebsite(res.url)
}
