import iconv from 'iconv-lite'
import { isValidUrl, to } from '.'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'

// 输入一个 url，返回对应的 html
export default async function fetchHtml(url: string) {
  if (!isValidUrl(url)) throw new Error('无效的 URL')

  const [err, res] = await to(
    fetch(url, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
      signal: AbortSignal.timeout(10 * 1000),
      redirect: 'follow',
    })
  )

  if (err) {
    if (err.name === 'TimeoutError') {
      throw new Error('获取 HTML 超时')
    }
    throw new Error('未知错误：获取 HTML 失败')
  }
  // console.log(res.url)

  return {
    html: decodeHtml(Buffer.from(await res.arrayBuffer())),
    // 如果发生了重定向，这里的 url 和传入的 url 不一样
    url: res.url,
  }
}

/**
 * 解码 HTML 文档
 */
function decodeHtml(buffer: Buffer) {
  let charset: 'utf8' | 'gb2312' | 'gbk' = 'utf8'
  let htmlStr = iconv.decode(buffer, charset)

  if (/<meta[\s\S]+?charset="?gb2312[\s\S]+?>/gi.test(htmlStr)) {
    charset = 'gb2312'
  }
  if (/<meta[\s\S]+?charset="?gbk[\s\S]+?>/gi.test(htmlStr)) {
    charset = 'gbk'
  }
  if (charset !== 'utf8') {
    htmlStr = iconv.decode(buffer, charset)
  }

  return htmlStr
}
