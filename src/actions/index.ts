'use server'

import {
  AiProviderController,
  CredentialsController,
  PublicBookmarkController,
  PublicTagController,
  UserController,
  UserBookmarkController,
  UserReadLaterController,
  UserTagController,
  aiProvidersConfigSchema,
  duplicateAiProviderSchema,
  listAiProviderModelsSchema,
  createReadLaterItemSchema,
  findManyReadLaterItemsSchema,
  readLaterItemIdSchema,
  testAiProviderSchema,
  updateReadLaterItemSchema,
} from '@/controllers'
import {
  aiAnalyzeRelatedTagsInput,
  aiAnalyzeWebsiteInput,
  checkGithubOAuthConfig,
  deleteUserInput,
  extractHtmlInfoInput,
  updateUserProfileInput,
} from './items'
import { makeAction as make } from './make-action'

/// PublicBookmark
export const actTotalPublicBookmarks = make(PublicBookmarkController.total, { guard: false })
export const actFindPublicBookmarks = make(PublicBookmarkController.findMany, { guard: false })
export const actInsertPublicBookmark = make(PublicBookmarkController.insert, { guard: 'admin' })
export const actQueryPublicBookmark = make(PublicBookmarkController.query, { guard: 'admin' })
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

/// UserReadLater
export const actCreateReadLaterItem = make(UserReadLaterController.createFromUrl, {
  schema: createReadLaterItemSchema,
})
export const actFindReadLaterItems = make(UserReadLaterController.findMany, {
  schema: findManyReadLaterItemsSchema,
})
export const actMarkReadLaterItemRead = make(UserReadLaterController.markRead, {
  schema: readLaterItemIdSchema,
})
export const actDeleteReadLaterItem = make(UserReadLaterController.delete, {
  schema: readLaterItemIdSchema,
})
export const actUpdateReadLaterItem = make(UserReadLaterController.update, {
  schema: updateReadLaterItemSchema,
})

/// Users
export const actFindUsers = make(UserController.findMany, { guard: 'admin' })
export const actDeleteUser = make(deleteUserInput)

/// 大模型供应商配置
export const actGetAiProvidersConfig = make(AiProviderController.getConfig, { guard: 'admin' })
export const actSaveAiProvidersConfig = make(AiProviderController.saveConfig, {
  guard: 'admin',
  schema: aiProvidersConfigSchema,
})
export const actDuplicateAiProvider = make(AiProviderController.duplicateProvider, {
  guard: 'admin',
  schema: duplicateAiProviderSchema,
})
export const actTestAiProvider = make(AiProviderController.testProvider, {
  guard: 'admin',
  schema: testAiProviderSchema,
})
export const actListAiProviderModels = make(AiProviderController.listModels, {
  guard: 'admin',
  schema: listAiProviderModelsSchema,
})
export const actClearAiProvidersConfig = make(AiProviderController.clearConfig, { guard: 'admin' })

/// 解析网站、标签
export const actExtractHtmlInfo = make(extractHtmlInfoInput)
export const actAnalyzeWebsite = make(aiAnalyzeWebsiteInput)
export const actAnalyzeRelatedTags = make(aiAnalyzeRelatedTagsInput)

/// 账号认证
export const actRegisterUser = make(CredentialsController.create, { guard: false })
export const actVerifyUser = make(CredentialsController.verify, { guard: false })
export const actUpdateUserProfile = make(updateUserProfileInput)

export const actCheckGithubOAuthConfig = make(checkGithubOAuthConfig, { guard: false })
