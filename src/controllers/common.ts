import { schema } from '@/db'
import { ilike, like, or } from 'drizzle-orm'

export function createBookmarkFilterByKeyword(
  table: typeof schema.publicBookmarks | typeof schema.userBookmarks,
  kw: string
) {
  if (process.env.DB_DRIVER === 'postgresql') {
    return or(
      ilike(table.name, `%${kw}%`),
      ilike(table.pinyin, `%${kw}%`),
      ilike(table.url, `%${kw}%`),
      ilike(table.description, `%${kw}%`)
    )!
  }
  return or(
    like(table.name, `%${kw}%`),
    like(table.pinyin, `%${kw}%`),
    like(table.url, `%${kw}%`),
    like(table.description, `%${kw}%`)
  )!
}
