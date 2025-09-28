import { z } from '@/lib/zod'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { schema } from './'

const { publicBookmarks, publicTags } = schema

const PublicTagOnlyId = createSelectSchema(publicTags).pick({ id: true })
const PublicBookmarkOnlyId = createSelectSchema(publicBookmarks).pick({ id: true })

const RelatedTagIds = z.object({ relatedTagIds: PublicTagOnlyId.shape.id.array().optional() })

// 前后端交互时，日期字段传字符串或时间戳数字，Date 类型数据是无法传输的
const DateSchema = z.date().or(
  z
    .string()
    .or(z.number())
    .transform((v) => new Date(v))
)

/**
 * @deprecated
 */
export const zodSchema = {
  publicTags: {
    insert: () => createInsertSchema(publicTags).extend(RelatedTagIds.shape),
    update: () =>
      createUpdateSchema(publicTags, {
        id: PublicTagOnlyId.shape.id,
        createdAt: DateSchema.optional(),
        updatedAt: DateSchema.optional(),
      }),
    delete: () => PublicTagOnlyId,
  },
  publicBookmarks: {
    insert: () => createInsertSchema(publicBookmarks).extend(RelatedTagIds.shape),
    update: () =>
      createUpdateSchema(publicBookmarks, {
        id: PublicBookmarkOnlyId.shape.id,
        createdAt: DateSchema.optional(),
        updatedAt: DateSchema.optional(),
      }),
    delete: () => PublicBookmarkOnlyId,
  },
}
