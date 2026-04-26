import { describe, expect, test } from 'vitest'

import { parseAiJsonObject } from './json'
import { analyzeReadLaterArticleSchema } from './schemas'

describe('analyzeReadLaterArticleSchema', () => {
  test('requires title summary and reading time', () => {
    const result = parseAiJsonObject(
      JSON.stringify({
        title: '文章标题',
        summary: '这是一段足够明确的文章摘要，用于帮助用户判断稍后是否阅读。',
        estimatedReadingMinutes: 3,
      }),
      analyzeReadLaterArticleSchema
    )

    expect(result.title).toBe('文章标题')
    expect(result.summary).toContain('文章摘要')
    expect(result.estimatedReadingMinutes).toBe(3)
  })

  test('normalizes reading time to at least one minute', () => {
    const result = parseAiJsonObject(
      JSON.stringify({
        title: '短文',
        summary: '这是一段非常短的内容摘要。',
        estimatedReadingMinutes: 0,
      }),
      analyzeReadLaterArticleSchema
    )

    expect(result.estimatedReadingMinutes).toBe(1)
  })
})
