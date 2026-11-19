import { generateText } from 'ai'
import { assert, describe, expect, test, vi } from 'vitest'
import * as aiObject from '@/lib/ai/generateObject'
import { analyzeRelatedTags, analyzeWebsite } from '.'
import { getOpenAICompatibleModel } from './providers'

test('空标签库也能根据名称生成主题色和图标', async ({ onTestFinished }) => {
  const result = { relatedTags: [], themeColor: '#61DAFB', icon: 'simple-icons:react' }
  const generate = vi.spyOn(aiObject, 'generateAiObject').mockResolvedValueOnce(result)
  onTestFinished(() => {
    generate.mockRestore()
  })

  await expect(analyzeRelatedTags('React', [])).resolves.toEqual(result)
  expect(generate).toHaveBeenCalledWith(
    expect.objectContaining({ prompt: expect.stringContaining('{"targetTag":"React","tags":[]}') })
  )
})

describe.skip('AI module', { timeout: 30 * 1000 }, () => {
  test('ai-sdk 测试', async () => {
    const res = await generateText({
      model: await getOpenAICompatibleModel(),
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
