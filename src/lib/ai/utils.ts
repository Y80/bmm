import { load } from 'cheerio'
import { Method } from '../http'
import { CommonFetchParams } from './types'

export async function commonFetch<T = any>({ url, body, token, headers }: CommonFetchParams) {
  const res = await fetch(url, {
    method: Method.POST,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch (error) {
    console.error('JSON 解析错误: ', error)
  }
}

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

export async function createPayload(params: { html: string; url: string; tags: string[] }) {
  const { html, url, tags } = params
  const $ = load(html)
  // 清理数据
  $('script').remove()
  $('style').remove()
  $('link[rel="dns-prefetch"]').remove()
  $('link[rel="stylesheet"]').remove()
  const payload = {
    url,
    head: $('head').html(),
    innerText: getInnerText(html),
    tags,
  }
  return payload
}
