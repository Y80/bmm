import { and, desc, eq } from 'drizzle-orm'
import { load } from 'cheerio'

import { db, schema } from '@/db'
import { analyzeReadLaterArticle } from '@/lib/ai'
import { getAuthedUserId } from '@/lib/auth'
import { z } from '@/lib/zod'
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

function createFallbackArticle(url: string) {
  return {
    title: url,
    summary: '暂时无法获取页面内容，请稍后重试，或手动补充标题、图标与摘要。',
    estimatedReadingMinutes: 1,
  }
}

function normalizeText(text = '') {
  return text.replace(/\s+/g, ' ').trim()
}

function estimateReadingMinutes(text: string) {
  const length = normalizeText(text).length
  if (!length) return 1
  return Math.max(1, Math.min(60, Math.ceil(length / 350)))
}

function extractArticleFromHtml(html: string, url: string) {
  const fallback = createFallbackArticle(url)
  const $ = load(html)

  $('script, style, nav, footer, noscript').remove()

  const title =
    normalizeText($('meta[property="og:title"]').attr('content')) ||
    normalizeText($('head > title').text()) ||
    normalizeText($('h1').first().text()) ||
    fallback.title

  const summaryCandidates = [
    $('meta[name="description"]').attr('content'),
    $('meta[property="og:description"]').attr('content'),
    $('article p')
      .toArray()
      .map((item) => $(item).text())
      .join(' '),
    $('main').text(),
    $('body').text(),
  ]
  const summarySource = summaryCandidates.map((item) => normalizeText(item)).find(Boolean) || ''
  const summary = summarySource.slice(0, 160) || fallback.summary

  return {
    title,
    summary,
    estimatedReadingMinutes: estimateReadingMinutes($('article').text() || $('body').text()),
  }
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

    let article = createFallbackArticle(url)
    let mode: CreateReadLaterItemResult['mode'] = 'url'
    if (html) {
      article = extractArticleFromHtml(html, url)
      mode = 'html'
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
