import { describe, expect, test } from 'vitest'
import { extractAiJsonText } from './extractJsonText'

describe('extractAiJsonText', () => {
  test('keeps plain json object unchanged', () => {
    expect(extractAiJsonText('{"title":"BMM"}')).toBe('{"title":"BMM"}')
  })

  test('extracts final json object after think reasoning', () => {
    expect(
      extractAiJsonText(`
<think>
先分析，再输出。
{"title":"example"}
</think>
{"title":"final","count":1}.
`)
    ).toBe('{"title":"final","count":1}')
  })

  test('strips markdown json code fence', () => {
    expect(
      extractAiJsonText(`
\`\`\`json
{"title":"BMM"}
\`\`\`
`)
    ).toBe('{"title":"BMM"}')
  })
})
