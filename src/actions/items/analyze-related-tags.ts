import { PublicTagController, UserTagController } from '@/controllers'
import { analyzeRelatedTags } from '@/lib/ai'
import { z } from '@/lib/zod'
import { PageRoutes } from '@cfg'
import { headers } from 'next/headers'
import { makeActionInput } from '../make-action'

const schema = z.string().url()

async function handleAnalyzeRelatedTags(tag: typeof schema._input) {
  const referer = headers().get('referer')
  const isAdminSpace = PageRoutes.Admin.space(referer)
  const isUserSpace = PageRoutes.User.space(referer)
  if (!isAdminSpace && !isUserSpace) throw new Error('内部错误')
  const tags = isAdminSpace
    ? await PublicTagController.getAllNames()
    : await UserTagController.getAllNames()
  return await analyzeRelatedTags(tag, tags)
}

export const aiAnalyzeRelatedTagsInput = makeActionInput({
  handler: handleAnalyzeRelatedTags,
  schema,
  guard: 'decide-by-referer',
})
