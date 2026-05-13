import { z } from '@/lib/zod'
import fetchHtml from '@/utils/fetch-html'
import * as cheerio from 'cheerio'
import { makeActionInput } from '../make-action'

const schema = z.url()

export const extractHtmlInfoInput = makeActionInput({
  handler: extractHtmlInfo,
  schema,
})

async function extractHtmlInfo(inputUrl: z.output<typeof schema>) {
  const { html, finalUrl } = await fetchHtml(inputUrl)
  const $ = cheerio.load(html)
  const name = $('title').first().text().trim()
  const description = $('meta[name="description"]').attr('content') ?? ''
  const href = $('link[rel="icon"], link[rel="shortcut icon"]').first().attr('href')
  const icon = href ? new URL(href, finalUrl).href : ''

  return { name, description, icon }
}
