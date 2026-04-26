import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import AiProviderController from '@/controllers/AiProvider.controller'

export async function getOpenAICompatibleModel() {
  const activeProvider = await AiProviderController.getActiveProvider()
  const provider = createOpenAICompatible({
    apiKey: activeProvider.apiKey,
    baseURL: activeProvider.baseUrl,
    name: activeProvider.name,
  })
  return provider(activeProvider.model)
}
