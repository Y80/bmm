'use server'

import {
  PublicBookmarkController,
  PublicTagController,
  UserBookmarkController,
  UserTagController,
} from '@/controllers'
import { aiAnalyzeRelatedTagsInput, aiAnalyzeWebsiteInput, extractHtmlInfoInput } from './items'
import { makeAction as make } from './make-action'

/// PublicBookmark
export const actTotalPublicBookmarks = make(PublicBookmarkController.total, { guard: false })
export const actFindPublicBookmarks = make(PublicBookmarkController.findMany, { guard: false })
export const actInsertPublicBookmark = make(PublicBookmarkController.insert, { guard: 'admin' })
export const actQueryPublicBookmark = make(PublicBookmarkController.query)
export const actDeletePublicBookmark = make(PublicBookmarkController.delete, { guard: 'admin' })
export const actUpdatePublicBookmark = make(PublicBookmarkController.update, { guard: 'admin' })

/// PublicTag
export const actGetAllPublicTags = make(PublicTagController.getAll, { guard: false })
export const actInsertPublicTag = make(PublicTagController.insert, { guard: 'admin' })
export const actDeletePublicTag = make(PublicTagController.remove, { guard: 'admin' })
export const actUpdatePublicTag = make(PublicTagController.update, { guard: 'admin' })
export const actUpdatePublicTagSortOrders = make(PublicTagController.sort, { guard: 'admin' })
export const actTryCreatePublicTags = make(PublicTagController.tryCreateTags, { guard: 'admin' })

/// UserTag
export const actGetAllUserTags = make(UserTagController.getAll)
export const actInsertUserTag = make(UserTagController.insert)
export const actUpdateUserTag = make(UserTagController.update)
export const actDeleteUserTag = make(UserTagController.remove)
export const actUpdateUserTagSortOrders = make(UserTagController.sort)
export const actTryCreateUserTags = make(UserTagController.tryCreateTags)

/// UserBookmark
export const actTotalUserBookmarks = make(UserBookmarkController.total)
export const actFindUserBookmarks = make(UserBookmarkController.findMany)
export const actInsertUserBookmark = make(UserBookmarkController.insert)
export const actQueryUserBookmark = make(UserBookmarkController.query)
export const actDeleteUserBookmark = make(UserBookmarkController.delete)
export const actUpdateUserBookmark = make(UserBookmarkController.update)

/// 解析网站、标签
export const actExtractHtmlInfo = make(extractHtmlInfoInput)
export const actAnalyzeWebsite = make(aiAnalyzeWebsiteInput)
export const actAnalyzeRelatedTags = make(aiAnalyzeRelatedTagsInput)
