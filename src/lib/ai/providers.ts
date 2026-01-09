import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export function getOpenAICompatibleModel() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('请配置环境变量 OPENAI_API_KEY')
  }
  if (!process.env.OPENAI_BASE_URL) {
    throw new Error('请配置环境变量 OPENAI_BASE_URL')
  }
  if (!process.env.OPENAI_MODEL) {
    throw new Error('请配置环境变量 OPENAI_MODEL')
  }
  const provider = createOpenAICompatible({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL!,
    name: 'openai-compatible',
  })
  return provider(process.env.OPENAI_MODEL!)
}
