// 这个文件里导出的所有异步函数，都可以在 Client 组件中直接调用
'use server'

import PublicBookmarkController, {
  InsertPublicBookmark,
} from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import { zodSchema } from '@/db/zod'
import { to } from '@/utils'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import { auth } from './auth'

interface WrapActionOptions {
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
function wrapAction<T extends (payload: any) => Promise<any>>(action: T, opts?: WrapActionOptions) {
  opts = {
    guard: 'user',
    ...opts,
  }
  type Payload = Omit<Parameters<T>[0], 'userId'>
  return async (payload: Payload) => {
    let session
    if (opts.guard || opts.injectUserId) {
      session = await auth()
      console.log('auth() 返回的 session:\n', session)
      if (!session) {
        return redirect(PageRoutes.LOGIN)
      }
      if (opts.injectUserId) {
        payload = { ...payload, userId: session.user.id }
      }
    }
    const [error, data] = await to(action(payload))
    if (error) {
      console.error(error)
      return { err: error?.message || '未知错误' }
    }
    return { data }
  }
}

export const getAllPublicTags = PublicTagController.getAll
export const updateTagSortOrders = PublicTagController.updateSortOrders
export const tryCreateTags = PublicTagController.tryCreateTags
export const findManyBookmarks = PublicBookmarkController.findMany
export const updatePublicTag = wrapAction(PublicTagController.update, { injectUserId: true })

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
  if (error.message.includes('duplicate key value violates unique constraint')) {
    if (error.message.includes('publicBookmarks_name_unique')) {
      errorMsg = '创建失败：已存在相同名称的书签'
    } else if (error.message.includes('publicBookmarks_url_unique')) {
      errorMsg = '创建失败：已存在相同 URL 的书签'
    }
  }
  return { errorMsg: errorMsg || error?.message || '未知错误' }
}
