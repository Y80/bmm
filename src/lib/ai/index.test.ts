import { generateText } from 'ai'
import { assert, describe, test } from 'vitest'
import { analyzeRelatedTags, analyzeWebsite } from '.'
import { getOpenAICompatibleModel } from './providers'

describe('AI module', { timeout: 30 * 1000 }, () => {
  test('ai-sdk 测试', async () => {
    const res = await generateText({
      model: getOpenAICompatibleModel(),
      prompt: '你好',
    })
    console.log(res.text)
  })

  test('分析网站', async () => {
    const url = 'http://gitlab.cn/'
    const data = await analyzeWebsite(url)
    assert.isObject(data)
    console.log(data)
  })

  test('分析标签', async () => {
    const data = await analyzeRelatedTags('Ant Design', [
      'JavaScript',
      'React',
      'Rust',
      '资讯',
      '图片',
    ])
    assert.isObject(data)
    assert.include(data.relatedTags, 'React')
    console.log(data)
  })
})
