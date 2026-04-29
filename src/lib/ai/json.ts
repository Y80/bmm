import { z } from '@/lib/zod'

export function stripJsonCodeFence(text: string) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

export function findJsonObjectTexts(text: string) {
  const trimmed = stripJsonCodeFence(text)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return [trimmed]

  const results: string[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      if (depth === 0) {
        start = i
      }
      depth += 1
      continue
    }

    if (char === '}' && depth > 0) {
      depth -= 1
      if (depth === 0 && start !== -1) {
        results.push(trimmed.slice(start, i + 1))
        start = -1
      }
    }
  }

  return results
}

export function parseAiJsonObject<T extends z.ZodType>(text: string, schema: T): z.output<T> {
  const jsonTexts = findJsonObjectTexts(text)
  if (!jsonTexts.length) {
    throw new Error('AI 响应不是有效的 JSON 对象')
  }

  let firstParseError: Error | null = null
  let firstSchemaError = ''
  for (const jsonText of jsonTexts.reverse()) {
    let value: unknown
    try {
      value = JSON.parse(jsonText)
    } catch (error) {
      firstParseError ||= error instanceof Error ? error : new Error('JSON parse failed')
      continue
    }

    const result = schema.safeParse(value)
    if (result.success) {
      return result.data
    }
    firstSchemaError ||= result.error.issues[0]?.message || ''
  }

  if (firstParseError) {
    throw new Error('AI 响应不是有效的 JSON 对象')
  }
  throw new Error(
    'AI 响应 JSON 数据结构不符合预期' + (firstSchemaError ? '：' + firstSchemaError : '')
  )
}
