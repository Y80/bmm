import fetchHtml from '@/utils/fetch-html'
import { generateText } from 'ai'
import { parseAiJsonObject } from './json'
import { createWebsiteAnalysisPayload } from './payload'
import { getOpenAICompatibleModel } from './providers'
import {
  analyzeWebsiteSystemPrompt,
  createAnalyzeRelatedTagsPrompt,
  createAnalyzeWebsitePrompt,
} from './prompts'
import { analyzeRelatedTagsSchema, analyzeWebsiteSchema } from './schemas'

/**
 * 分析网站，自动打标签、获取标题、描述、图标地址
 */
export async function analyzeWebsite(inputUrl: string, tags: string[] = []) {
  const { html, url } = await fetchHtml(inputUrl)
  const payload = createWebsiteAnalysisPayload({ html, url, tags })
  const { text } = await generateText({
    model: await getOpenAICompatibleModel(),
    system: analyzeWebsiteSystemPrompt,
    prompt: createAnalyzeWebsitePrompt(payload),
  })
  return parseAiJsonObject(text, analyzeWebsiteSchema)
}

/**
 * 传入一个标签名称，从数据库中读取所有标签名称，根据名字语义分析和传入标签相关的书签
 */
export async function analyzeRelatedTags(tag: string, tags: string[]) {
  const payload = {
    targetTag: tag,
    tags,
  }
  if (!payload.tags.length) {
    throw new Error('数据库标签数据为空，请先创建标签再调用当前 AI 功能')
  }

  const { text } = await generateText({
    model: await getOpenAICompatibleModel(),
    prompt: createAnalyzeRelatedTagsPrompt(payload),
  })
  return parseAiJsonObject(text, analyzeRelatedTagsSchema)
}

export type { AnalyzeRelatedTagsResult, AnalyzeWebsiteResult } from './schemas'
