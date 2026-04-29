import { describe, expect, test } from 'vitest'
import { z } from '@/lib/zod'
import { parseAiJsonObject } from './json'
import { analyzeRelatedTagsSchema } from './schemas'

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
})

describe('parseAiJsonObject', () => {
  test('解析纯 JSON 对象', () => {
    expect(parseAiJsonObject('{"title":"BMM","tags":["AI"]}', schema)).toEqual({
      title: 'BMM',
      tags: ['AI'],
    })
  })

  test('解析被 Markdown 代码块包裹的 JSON 对象', () => {
    expect(
      parseAiJsonObject('```json\n{"title":"BMM","tags":["Bookmark"]}\n```', schema)
    ).toEqual({
      title: 'BMM',
      tags: ['Bookmark'],
    })
  })

  test('响应不是 JSON 对象时抛出可读错误', () => {
    expect(() => parseAiJsonObject('我无法处理这个网站', schema)).toThrowError(
      'AI 响应不是有效的 JSON 对象'
    )
  })

  test('JSON 数据结构不符合预期时抛出可读错误', () => {
    expect(() => parseAiJsonObject('{"title":"BMM","tags":"AI"}', schema)).toThrowError(
      'AI 响应 JSON 数据结构不符合预期'
    )
  })

  test('解析标签分析结果中的 Iconify 图标名称', () => {
    expect(
      parseAiJsonObject(
        '{"relatedTags":["React"],"themeColor":"#61DAFB","icon":"simple-icons:react"}',
        analyzeRelatedTagsSchema
      )
    ).toEqual({
      relatedTags: ['React'],
      themeColor: '#61DAFB',
      icon: 'simple-icons:react',
    })
  })

  test('标签分析结果拒绝非 Iconify 图标名称', () => {
    expect(() =>
      parseAiJsonObject(
        '{"relatedTags":[],"themeColor":"#334155","icon":"https://example.com/icon.svg"}',
        analyzeRelatedTagsSchema
      )
    ).toThrowError('icon 必须是 Iconify 图标名称')
  })

  test('解析带 think 包裹且前面含示例对象的最终 JSON', () => {
    expect(
      parseAiJsonObject(
        `<think>
先推理，再给出结果。
示例：
{"relatedTags":["foo"],"themeColor":"#000000","icon":"mdi:home"}
</think>
{
  "relatedTags": ["React"],
  "themeColor": "#61DAFB",
  "icon": "logos:react"
}`,
        analyzeRelatedTagsSchema
      )
    ).toEqual({
      relatedTags: ['React'],
      themeColor: '#61DAFB',
      icon: 'logos:react',
    })
  })
})
