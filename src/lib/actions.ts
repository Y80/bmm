// 这个文件里导出的所有异步函数，都可以在 Client 组件中直接调用
'use server'

import PublicBookmarkController, {
  InsertPublicBookmark,
} from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import { zodSchema } from '@/db/zod'

const getAllPublicTags = PublicTagController.getAll

const updateTagSortOrders = PublicTagController.updateSortOrders

export { getAllPublicTags, updateTagSortOrders }

export const tryCreateTags = PublicTagController.tryCreateTags

export async function insertBookmark(payload: InsertPublicBookmark) {
  const parseRes = zodSchema.publicBookmarks.insert().safeParse(payload)
  if (parseRes.error) {
    throw new Error(parseRes.error.toString())
  }
  try {
    await PublicBookmarkController.insert(parseRes.data)
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('publicBookmarks_name_unique')) {
          throw new Error('创建失败：已存在相同名称的书签')
        }
        if (error.message.includes('publicBookmarks_url_unique')) {
          throw new Error('创建失败：已存在相同 URL 的书签')
        }
      }
    }
    throw error
  }
}
