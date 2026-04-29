import fetchHtml from '@/utils/fetch-html'
import { generateAiObject } from './generateObject'
import { createReadLaterArticlePayload, createWebsiteAnalysisPayload } from './payload'
import {
  analyzeReadLaterArticleSystemPrompt,
  analyzeWebsiteSystemPrompt,
  createAnalyzeReadLaterArticlePrompt,
  createAnalyzeRelatedTagsPrompt,
  createAnalyzeWebsitePrompt,
} from './prompts'
import {
  analyzeReadLaterArticleSchema,
  analyzeRelatedTagsSchema,
  analyzeWebsiteSchema,
} from './schemas'

/**
 * 分析网站，自动打标签、获取标题、描述、图标地址
 */
export async function analyzeWebsite(inputUrl: string, tags: string[] = []) {
  const { html, url } = await fetchHtml(inputUrl)
  const payload = createWebsiteAnalysisPayload({ html, url, tags })
  return generateAiObject({
    schema: analyzeWebsiteSchema,
    schemaName: 'website_analysis',
    system: analyzeWebsiteSystemPrompt,
    prompt: createAnalyzeWebsitePrompt(payload),
  })
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

  return generateAiObject({
    schema: analyzeRelatedTagsSchema,
    schemaName: 'related_tags_analysis',
    prompt: createAnalyzeRelatedTagsPrompt(payload),
  })
}

export async function analyzeReadLaterArticle(html: string, url: string) {
  const payload = createReadLaterArticlePayload({ html, url })
  return generateAiObject({
    schema: analyzeReadLaterArticleSchema,
    schemaName: 'read_later_article_analysis',
    system: analyzeReadLaterArticleSystemPrompt,
    prompt: createAnalyzeReadLaterArticlePrompt(payload),
  })
}

export type {
  AnalyzeReadLaterArticleResult,
  AnalyzeRelatedTagsResult,
  AnalyzeWebsiteResult,
} from './schemas'
