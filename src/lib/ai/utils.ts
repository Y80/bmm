import PublicTagController from '@/controllers/PublicTag.controller'
import { load } from 'cheerio'
import { isPlainObject } from 'lodash'
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
  return res.json() as Promise<T>
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

export async function createPayload({ html, url }: { html: string; url: string }) {
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
    tags: (await PublicTagController.getAllNames()).join('/'),
  }
  return payload
}

/**
 * 提取 AI 响应中 content 内的 JSON 字符串，并将其反序列化
 *
 * （当前大部分 AI 不具备根据 prompt 要求一定输出 JSON 字符串的能力）
 */
function extraAiResponseJson(input: string) {
  try {
    const str = input.match(/{[\s\S]+?}/)?.[0]
    const data = JSON.parse(str || '')
    if (isPlainObject(data)) {
      process.env.AI_DEBUG && console.log('反序列化 AI 响应结果：\n', data)
      return data
    }
  } catch (error) {}
  throw new Error('AI 响应解析失败')
}

export function chatResultAdapter(input: string) {
  const data = extraAiResponseJson(input)
  const res = {
    title: '',
    description: '',
    favicon: '',
    tags: [] as string[],
  }
  const { title, description, tags, favicon } = data
  if (typeof title === 'string') {
    res.title = title
  }
  if (typeof description === 'string') {
    res.description = description
  }
  if (typeof favicon === 'string') {
    res.favicon = favicon
  }
  if (Array.isArray(tags) && tags.every((el) => typeof el === 'string')) {
    res.tags = tags
  }
  return res
}

export function chatResultAdapter2(input: string) {
  const data = extraAiResponseJson(input)
  const res = {
    relatedTags: [] as string[],
    color: '',
  }
  const { relatedTags, color } = data
  if (Array.isArray(relatedTags) && relatedTags.every((el) => typeof el === 'string')) {
    res.relatedTags = relatedTags
  }
  if (typeof color === 'string') {
    res.color = color
  }
  return res
}
