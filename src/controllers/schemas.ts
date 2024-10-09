import { z } from '@/lib/zod'

export const findManyBookmarksSchema = z.object({
  keyword: z.string().optional(),
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
    .transform((v) => Number(v) || 20),
  page: z
    .number()
    .or(z.string())
    .optional()
    .transform((v) => Number(v) || 1),
})
