import { schema } from '@/db'
import { ilike, like, or } from 'drizzle-orm'

export function createBookmarkFilterByKeyword(
  table: typeof schema.publicBookmarks | typeof schema.userBookmarks,
  kw: string
) {
  const sql = process.env.DB_DRIVER === 'postgresql' ? ilike : like
  return or(
    sql(table.name, `%${kw}%`),
    sql(table.pinyin, `%${kw}%`),
    sql(table.url, `%${kw}%`),
    sql(table.description, `%${kw}%`)
  )!
}
