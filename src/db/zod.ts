import { z } from '@/lib/zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { schema } from './'

const { publicBookmarks, publicTags } = schema

export const zodSchema = {
  publicTags: {
    idObjSchema: () => createSelectSchema(publicTags).pick({ id: true }),
    extraObjSchema: () => z.object({ relatedTagIds: z.number().array().optional() }),
    // select: () => createSelectSchema(publicTags),
    insert: () => createInsertSchema(publicTags).merge(zodSchema.publicTags.extraObjSchema()),
    // partial(): like TS Partial<T>
    update: () =>
      zodSchema.publicTags
        .insert()
        .merge(
          z.object({
            createdAt: z.string().transform((v) => new Date(v)),
            updatedAt: z.string().transform((v) => new Date(v)),
          })
        )
        .partial()
        .merge(zodSchema.publicTags.idObjSchema()),
    delete: () => zodSchema.publicTags.idObjSchema(),
    // update or delete: only id field is required
    updateOrDelete: () => zodSchema.publicTags.update(),
  },
  publicBookmarks: {
    idObjSchema: () => createSelectSchema(publicBookmarks).pick({ id: true }),
    extraObjSchema: () => z.object({ relatedTagIds: z.number().array().optional() }),
    // select: () => createSelectSchema(publicBookmarks),
    insert: () =>
      createInsertSchema(publicBookmarks).merge(zodSchema.publicBookmarks.extraObjSchema()),
    // partial(): like TS Partial<T>
    update: () =>
      zodSchema.publicBookmarks
        .insert()
        .merge(
          z.object({
            createdAt: z.string().transform((v) => new Date(v)),
            updatedAt: z.string().transform((v) => new Date(v)),
          })
        )
        .partial()
        .merge(zodSchema.publicBookmarks.idObjSchema()),
    delete: () => zodSchema.publicBookmarks.idObjSchema(),
  },
}
