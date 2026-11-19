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
  const { html, finalUrl } = await fetchHtml(inputUrl)
  const payload = createWebsiteAnalysisPayload({ html, url: finalUrl, tags })
  return generateAiObject({
    schema: analyzeWebsiteSchema,
    schemaName: 'website_analysis',
    system: analyzeWebsiteSystemPrompt,
    prompt: createAnalyzeWebsitePrompt(payload),
  })
}

/**
 * 根据标签名称推荐主题色、图标和已有的关联标签
 */
export async function analyzeRelatedTags(tag: string, tags: string[]) {
  const payload = {
    targetTag: tag,
    tags,
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
