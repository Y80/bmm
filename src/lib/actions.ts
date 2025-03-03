// 这个文件里导出的所有异步函数，都可以在 Client 组件中直接调用
'use server'

import PublicBookmarkController, {
  InsertPublicBookmark,
} from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import { zodSchema } from '@/db/zod'
import { to } from '@/utils'
import { auth } from './auth'

interface WrapActionOptions {
  guard?: 'user' | 'admin' | false
}
function wrapAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  opts?: WrapActionOptions
) {
  opts = {
    guard: 'user',
    ...opts,
  }
  return async (...args: Parameters<T>) => {
    let session
    if (opts.guard) {
      session = await auth()
      console.log(session)
      if (session?.user) {
        // return redirect('/login')
      }
    }

    const [error, res] = await to(action(...args))
    if (error) {
      console.error(error)
      return { errorMsg: error?.message || '未知错误' }
    }
    return { data: res }
  }
}

export const getAllPublicTags = PublicTagController.getAll
export const updateTagSortOrders = PublicTagController.updateSortOrders
export const tryCreateTags = PublicTagController.tryCreateTags
export const findManyBookmarks = PublicBookmarkController.findMany
export const updatePublicTag = wrapAction(PublicTagController.update)

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
