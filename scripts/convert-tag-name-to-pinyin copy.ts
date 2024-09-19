import { db, schema } from '@/db'
import { getPinyin } from '@/utils'
import { eq } from 'drizzle-orm'

db.query.publicTags.findMany().then(async (tags) => {
  for (const tag of tags) {
    await db
      .update(schema.publicTags)
      .set({ pinyin: getPinyin(tag.name) })
      .where(eq(schema.publicTags.id, tag.id))
  }
})
