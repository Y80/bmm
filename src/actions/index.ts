'use server'

import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import UserTagController from '@/controllers/UserTag.controller'
import { analyzeWebsite, extractHtmlInfo, handleAnalyzeRelatedTags } from './handlers'
import { makeAction as make } from './make-action'

export const actTotalPublicBookmarks = make(PublicBookmarkController.total, {
  guard: false,
})
export const actFindPublicBookmarks = make(PublicBookmarkController.findMany, {
  guard: false,
})
export const actInsertPublicBookmark = make(PublicBookmarkController.insert, {
  guard: 'admin',
})
export const actQueryPublicBookmark = make(PublicBookmarkController.query)
export const actDeletePublicBookmark = make(PublicBookmarkController.delete, { guard: 'admin' })
export const actUpdatePublicBookmark = make(PublicBookmarkController.update, { guard: 'admin' })
export const actGetAllPublicTags = make(PublicTagController.getAll, { guard: false })
export const actInsertPublicTag = make(PublicTagController.insert, { guard: 'admin' })
export const actDeletePublicTag = make(PublicTagController.remove, { guard: 'admin' })
export const actUpdatePublicTag = make(PublicTagController.update, { guard: 'admin' })
export const actUpdateTagSortOrders = make(PublicTagController.sort, { guard: 'admin' })

export const actInsertUserTag = make(UserTagController.insert)
export const actUpdateUserTag = make(UserTagController.update)

export const actExtractHtmlInfo = make(extractHtmlInfo, { schema: extractHtmlInfo.schema })
export const actAnalyzeWebsite = make(analyzeWebsite, {
  guard: 'decide-by-referer',
  schema: analyzeWebsite.schema,
})
export const actAnalyzeRelatedTags = make(handleAnalyzeRelatedTags, {
  guard: 'decide-by-referer',
  schema: handleAnalyzeRelatedTags.schema,
})
