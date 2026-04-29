import { extractJsonMiddleware, extractReasoningMiddleware, wrapLanguageModel } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import AiProviderController from '@/controllers/AiProvider.controller'
import { extractAiJsonText } from './extractJsonText'

export async function getOpenAICompatibleModel() {
  const activeProvider = await AiProviderController.getActiveProvider()
  const provider = createOpenAICompatible({
    apiKey: activeProvider.apiKey,
    baseURL: activeProvider.baseUrl,
    name: activeProvider.name,
  })
  return wrapLanguageModel({
    model: provider(activeProvider.model),
    middleware: [
      extractJsonMiddleware({ transform: extractAiJsonText }),
      extractReasoningMiddleware({ tagName: 'think' }),
    ],
  })
}
