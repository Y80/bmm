import { PublicTagController } from '@/controllers'
import UserTagController from '@/controllers/UserTag.controller'
import { analyzeWebsite as handler } from '@/lib/ai'
import { auth } from '@/lib/auth'
import { z } from '@/lib/zod'
import { PageRoutes } from '@cfg'
import { headers } from 'next/headers'

const schema = z.string().url()

export async function analyzeWebsite(url: typeof schema._input) {
  const userId = (await auth())?.user.id
  const referer = headers().get('referer')
  const isAdminSpace = PageRoutes.Admin.space(referer)
  const isUserSpace = PageRoutes.User.space(referer)
  if (!userId && !isAdminSpace && !isUserSpace) throw new Error('内部错误')
  const tags = isAdminSpace
    ? await PublicTagController.getAllNames()
    : await UserTagController.getAllNames(userId!)
  return await handler(url, tags)
}
analyzeWebsite.schema = schema
