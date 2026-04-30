import { and, desc, eq } from 'drizzle-orm'

import { db, schema } from '@/db'
import { analyzeReadLaterArticle } from '@/lib/ai'
import { getAuthedUserId } from '@/lib/auth'
import { z } from '@/lib/zod'
import { extractArticleFromHtml } from '@/utils/extract-article'
import fetchHtml from '@/utils/fetch-html'
import {
  createReadLaterItemSchema,
  findManyReadLaterItemsSchema,
  readLaterItemIdSchema,
  readLaterStatusSchema,
  updateReadLaterItemSchema,
} from './schemas'

const { userReadLaterItems } = schema

export type ReadLaterStatus = z.output<typeof readLaterStatusSchema>
export type SelectUserReadLaterItem = typeof userReadLaterItems.$inferSelect
export type CreateReadLaterItemResult = {
  item: SelectUserReadLaterItem
  mode: 'ai' | 'html' | 'url'
}

function userLimiter(userId: UserId, id?: number) {
  if (!id) return eq(userReadLaterItems.userId, userId)
  return and(eq(userReadLaterItems.id, id), eq(userReadLaterItems.userId, userId))
}

const UserReadLaterController = {
  async createFromUrl(input: z.output<typeof createReadLaterItemSchema>) {
    const userId = await getAuthedUserId()
    let url = input.url
    let html = ''
    try {
      const res = await fetchHtml(input.url)
      html = res.html
      url = res.url
    } catch {}

    const count = await db.$count(
      userReadLaterItems,
      and(eq(userReadLaterItems.userId, userId), eq(userReadLaterItems.url, url))
    )
    if (count > 0) throw new Error('该链接已在稍后阅读中')

    let article = extractArticleFromHtml(html, url)
    let mode: CreateReadLaterItemResult['mode'] = html ? 'html' : 'url'
    if (html) {
      try {
        article = await analyzeReadLaterArticle(html, url)
        mode = 'ai'
      } catch {}
    }

    const [row] = await db
      .insert(userReadLaterItems)
      .values({
        url,
        icon: null,
        title: article.title,
        summary: article.summary,
        estimatedReadingMinutes: article.estimatedReadingMinutes,
        status: 'unread',
        userId,
      })
      .returning()
    return {
      item: row,
      mode,
    }
  },

  async findMany(query?: z.output<typeof findManyReadLaterItemsSchema>) {
    query ||= findManyReadLaterItemsSchema.parse({})
    const userId = await getAuthedUserId()
    const filters = and(userLimiter(userId), eq(userReadLaterItems.status, query.status))
    const [total, list] = await Promise.all([
      db.$count(userReadLaterItems, filters),
      db.query.userReadLaterItems.findMany({
        where: filters,
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
        orderBy: [desc(userReadLaterItems.updatedAt)],
      }),
    ])

    return {
      total,
      hasMore: total > query.page * query.limit,
      list,
    }
  },

  async markRead(input: z.output<typeof readLaterItemIdSchema>) {
    const [row] = await db
      .update(userReadLaterItems)
      .set({
        status: 'read',
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(userLimiter(await getAuthedUserId(), input.id), eq(userReadLaterItems.status, 'unread')))
      .returning()
    if (!row) throw new Error('稍后阅读项目不存在或已读')
    return row
  },

  async update(input: z.output<typeof updateReadLaterItemSchema>) {
    const [row] = await db
      .update(userReadLaterItems)
      .set({
        icon: input.icon || null,
        title: input.title,
        summary: input.summary,
        updatedAt: new Date(),
      })
      .where(userLimiter(await getAuthedUserId(), input.id))
      .returning()
    if (!row) throw new Error('稍后阅读项目不存在')
    return row
  },

  async delete(input: z.output<typeof readLaterItemIdSchema>) {
    const rows = await db
      .delete(userReadLaterItems)
      .where(userLimiter(await getAuthedUserId(), input.id))
      .returning()
    if (!rows.length) throw new Error('稍后阅读项目不存在')
    return rows
  },
}

export default UserReadLaterController
