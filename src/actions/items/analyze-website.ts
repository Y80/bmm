import { PublicTagController } from '@/controllers'
import UserTagController from '@/controllers/UserTag.controller'
import { analyzeWebsite as handler } from '@/lib/ai'
import { z } from '@/lib/zod'
import { PageRoutes } from '@cfg'
import { headers } from 'next/headers'
import { makeActionInput } from '../make-action'

const schema = z.string().url()

async function analyzeWebsite(url: typeof schema._input) {
  const referer = headers().get('referer')
  const isAdminSpace = PageRoutes.Admin.space(referer)
  const isUserSpace = PageRoutes.User.space(referer)
  if (!isAdminSpace && !isUserSpace) throw new Error('内部错误')
  const tags = isAdminSpace
    ? await PublicTagController.getAllNames()
    : await UserTagController.getAllNames()
  return await handler(url, tags)
}

export const aiAnalyzeWebsiteInput = makeActionInput({
  handler: analyzeWebsite,
  schema,
  guard: 'decide-by-referer',
})
