import { load } from 'cheerio'

/**
 * 获取文档的 body.innerText
 * @param html 网站的 HTML 文档字符串
 * @returns <body> 标签的 innerText，通常是在浏览器中用户实际能看到的所有文本
 */
function getInnerText(html: string, separator = '/') {
  const $ = load(html)
  const body = $('html > body')[0]
  const textList: string[] = []

  function traverse(node: typeof body) {
    for (const childNode of node.childNodes) {
      if (childNode.type === 'text') {
        textList.push(childNode.data)
      } else if (childNode.type === 'tag') {
        const $childNode = $(childNode)
        if ($childNode.css('display') !== 'none' && $childNode.css('visibility') !== 'hidden') {
          traverse(childNode)
        }
      }
    }
  }

  traverse(body)
  return textList
    .map((text) => text.replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean)
    .join(separator)
}

export function createWebsiteAnalysisPayload(params: { html: string; url: string; tags: string[] }) {
  const { html, url, tags } = params
  const $ = load(html)

  $('script').remove()
  $('style').remove()
  $('link[rel="dns-prefetch"]').remove()
  $('link[rel="stylesheet"]').remove()

  return {
    url,
    head: $('head').html(),
    innerText: getInnerText(html),
    tags,
  }
}

export function createReadLaterArticlePayload(params: { html: string; url: string }) {
  const { html, url } = params
  const $ = load(html)

  $('script').remove()
  $('style').remove()
  $('link[rel="dns-prefetch"]').remove()
  $('link[rel="stylesheet"]').remove()
  $('nav').remove()
  $('footer').remove()

  return {
    url,
    head: $('head').html(),
    innerText: getInnerText($.html(), '\n').slice(0, 20000),
  }
}
