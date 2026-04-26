import { z } from '@/lib/zod'

export const analyzeWebsiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  favicon: z.string(),
})

export const analyzeRelatedTagsSchema = z.object({
  relatedTags: z.array(z.string()),
  themeColor: z.string(),
  icon: z
    .string()
    .regex(/^[a-z0-9-]+:[a-z0-9-]+$/, 'icon 必须是 Iconify 图标名称，例如 tabler:ad-circle'),
})

export const analyzeReadLaterArticleSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  estimatedReadingMinutes: z
    .number()
    .or(z.string().transform((v) => Number(v)))
    .transform((v) => Math.max(1, Math.ceil(Number(v) || 1))),
})

export type AnalyzeWebsiteResult = z.output<typeof analyzeWebsiteSchema>
export type AnalyzeRelatedTagsResult = z.output<typeof analyzeRelatedTagsSchema>
export type AnalyzeReadLaterArticleResult = z.output<typeof analyzeReadLaterArticleSchema>
