import { z } from '@/lib/zod'
import { to } from '@/utils'
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

  if (!icon) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    const [err, rsp] = await to(
      fetch(finalUrl + '/favicon.ico', { method: 'HEAD', signal: ctrl.signal })
    )
    clearTimeout(timer)
    if (!err && rsp.ok) return { name, description, icon: finalUrl + '/favicon.ico' }
  }

  return { name, description, icon }
}
