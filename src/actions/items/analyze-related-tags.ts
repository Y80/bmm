import { PublicTagController, UserTagController } from '@/controllers'
import { analyzeRelatedTags } from '@/lib/ai'
import { pageSpace } from '@/utils'
import { headers } from 'next/headers'
import { makeActionInput } from '../make-action'

async function handleAnalyzeRelatedTags(tag: string) {
  const referer = (await headers()).get('referer')
  const space = pageSpace(referer)
  if (!space.isAdmin && !space.isUser) throw new Error('内部错误')
  const tags = space.isAdmin
    ? await PublicTagController.getAllNames()
    : await UserTagController.getAllNames()
  return await analyzeRelatedTags(tag, tags)
}

export const aiAnalyzeRelatedTagsInput = makeActionInput({
  handler: handleAnalyzeRelatedTags,
})
