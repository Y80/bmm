import { PublicTagController, UserTagController } from '@/controllers'
import { analyzeRelatedTags } from '@/lib/ai'
import { auth } from '@/lib/auth'
import { z } from '@/lib/zod'
import { PageRoutes } from '@cfg'
import { headers } from 'next/headers'

const schema = z.string().url()

export async function handleAnalyzeRelatedTags(tag: typeof schema._input) {
  const userId = (await auth())?.user.id
  const referer = headers().get('referer')
  const isAdminSpace = PageRoutes.Admin.space(referer)
  const isUserSpace = PageRoutes.User.space(referer)
  if (!userId && !isAdminSpace && !isUserSpace) throw new Error('内部错误')
  const tags = isAdminSpace
    ? await PublicTagController.getAllNames()
    : await UserTagController.getAllNames(userId!)
  return await analyzeRelatedTags(tag, tags)
}
handleAnalyzeRelatedTags.schema = schema
