import OpenAI from 'openai'
import { assert, describe, test } from 'vitest'
import { analyzeWebsite } from '.'

describe('AI module', () => {
  test('OpenAI 服务', { timeout: 10 * 1000 }, async () => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL!,
      stream: false,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '你是谁？' },
      ],
    })
    console.log(completion.choices[0].message)
  })

  test('分析网站', { timeout: 30 * 1000 }, async () => {
    const url = 'http://gitlab.cn/'
    const data = await analyzeWebsite(url, [])
    assert.isObject(data)
    console.log(data)
  })
})
