import { robustUrl } from '@/utils'
import { z } from '@/lib/zod'
import { FieldConstraints } from '@cfg'
import { DEFAULT_BOOKMARK_PAGESIZE } from '@cfg'

export const findManyBookmarksSchema = z.object({
  keyword: z.string().optional(),
  tagNames: z.string().array().optional(),
  tagIds: z
    .string()
    .or(z.number())
    .array()
    .or(z.string().transform((v) => (v.includes(',') ? v.split(',') : [v])))
    .transform((v) => v.map((el) => Number(el)))
    .optional(),
  sorterKey: z
    .enum(['-updateTime', '+updateTime', '-createTime', '+createTime'])
    .default('-updateTime'),
  limit: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || DEFAULT_BOOKMARK_PAGESIZE),
  page: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || 1),
})

export const findManyUsersSchema = z.object({
  keyword: z.string().optional(),
  sorterKey: z.enum(['-createTime', '+createTime']).default('-createTime'),
  limit: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || DEFAULT_BOOKMARK_PAGESIZE),
  page: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || 1),
})

export const readLaterStatusSchema = z.enum(['unread', 'read'])

export const findManyReadLaterItemsSchema = z.object({
  status: readLaterStatusSchema.optional().default('unread'),
  limit: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || DEFAULT_BOOKMARK_PAGESIZE),
  page: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || 1),
})

export const createReadLaterItemSchema = z.object({
  url: z.url(),
})

export const readLaterItemIdSchema = z.object({
  id: z.number().or(z.string()).transform(Number),
})

export const updateReadLaterItemSchema = readLaterItemIdSchema.extend({
  icon: z
    .string()
    .trim()
    .refine((value) => !value || !!robustUrl(value), '请输入有效的图标 URL 地址'),
  title: z
    .string()
    .trim()
    .nonempty('标题不可为空')
    .max(
      FieldConstraints.MaxLen.BOOKMARK_NAME,
      `标题长度不能超过 ${FieldConstraints.MaxLen.BOOKMARK_NAME} 个字符`
    ),
  summary: z
    .string()
    .trim()
    .nonempty('摘要不可为空')
    .max(
      FieldConstraints.MaxLen.BOOKMARK_DESC,
      `摘要长度不能超过 ${FieldConstraints.MaxLen.BOOKMARK_DESC} 个字符`
    ),
})
