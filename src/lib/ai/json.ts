import { z } from '@/lib/zod'

function stripJsonCodeFence(text: string) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function findJsonObjectText(text: string) {
  const trimmed = stripJsonCodeFence(text)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return ''

  return trimmed.slice(start, end + 1)
}

export function parseAiJsonObject<T extends z.ZodType>(text: string, schema: T): z.output<T> {
  const jsonText = findJsonObjectText(text)
  if (!jsonText) {
    throw new Error('AI 响应不是有效的 JSON 对象')
  }

  let value: unknown
  try {
    value = JSON.parse(jsonText)
  } catch {
    throw new Error('AI 响应不是有效的 JSON 对象')
  }

  const result = schema.safeParse(value)
  if (!result.success) {
    throw new Error('AI 响应 JSON 数据结构不符合预期：' + result.error.issues[0]?.message)
  }
  return result.data
}
