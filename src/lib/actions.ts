// 这个文件里导出的所有异步函数，都可以在 Client 组件中直接调用
'use server'

import { parseWebsite } from '@/app/api/[...slug]/handlers/parse-website'
import PublicBookmarkController, {
  InsertPublicBookmark,
} from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import UserTagController from '@/controllers/UserTag.controller'
import { zodSchema } from '@/db/zod'
import { to } from '@/utils'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import { auth } from './auth'
import SqlXError from './SqlXError'

interface MakeActionOptions {
  /**
   * 接口守卫
   * - 'user': 需要登录
   * - 'admin': 需要管理员权限
   * - false: 不需要登录
   * @default 'user'
   */
  guard?: 'user' | 'admin' | false
  /**
   * 是否往第一个对象参数中注入 userId
   */
  injectUserId?: boolean
}
function makeAction<Data, Payload extends object>(
  handler: (payload: Payload) => Promise<Data>,
  opts?: MakeActionOptions
) {
  opts = {
    guard: 'user',
    ...opts,
  }
  return async (payload?: Omit<Payload, 'userId'>) => {
    if (opts.guard || opts.injectUserId) {
      const session = await auth()
      // console.log('auth() 返回的 session:\n', session)
      if (!session) {
        redirect(PageRoutes.LOGIN)
      }
      if (opts.injectUserId) {
        payload = { ...payload, userId: session.user.id } as Payload
      }
    }

    const [error, data] = await to(handler(payload as Payload))
    if (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
      return { error: { msg: SqlXError.getMessage(error) } } as const
    }
    return { data } as const
  }
}

export const tryCreateTags = PublicTagController.tryCreateTags

export const actTotalPublicBookmarks = makeAction(PublicBookmarkController.total, { guard: false })

export const actInsertPublicBookmarks = makeAction(PublicBookmarkController.insert, {
  guard: 'admin',
})
export const insertPublicTag = makeAction(PublicTagController.insert, { guard: 'admin' })
export const deletePublicTag = makeAction(PublicTagController.remove, { guard: 'admin' })
export const updatePublicTag = makeAction(PublicTagController.update, { guard: 'admin' })
export const updateTagSortOrders = makeAction(PublicTagController.sort, { guard: 'admin' })

export const insertUserTag = makeAction(UserTagController.insert, { injectUserId: true })
export const updateUserTag = makeAction(UserTagController.update, { injectUserId: true })

export async function insertBookmark(payload: InsertPublicBookmark) {
  const parseRes = zodSchema.publicBookmarks.insert().safeParse(payload)
  if (parseRes.error) {
    return { errorMsg: parseRes.error.toString() }
  }
  const [error] = await to(PublicBookmarkController.insert(parseRes.data))
  if (!error) {
    return {}
  }
  let errorMsg = ''
  return { errorMsg: errorMsg || error?.message || '未知错误' }
}

export const actParseWebsite = makeAction(parseWebsite)
