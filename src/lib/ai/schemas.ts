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

export type AnalyzeWebsiteResult = z.output<typeof analyzeWebsiteSchema>
export type AnalyzeRelatedTagsResult = z.output<typeof analyzeRelatedTagsSchema>
