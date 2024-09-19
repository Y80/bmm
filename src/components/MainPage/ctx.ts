import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { MouseEvent, createContext, useContext } from 'react'

type OnClickTag = (arg: {
  tag: SelectPublicTag
  isIntersected?: boolean
  event?: MouseEvent
}) => void

// selectedTags 和 /tag/$slug 相关数据流
// 进入 /tag/$slug 页面，根据解析设置 selectedTags

export interface MainPageContext {
  bookmarks: SelectPublicBookmark[]
  // currentTag: null | SelectPublicTag
  // 当前选中的标签。如果有多个标签，则为交集模式搜索书签
  selectedTags: SelectPublicTag[]
  setSelectedTags(tags: SelectPublicTag[]): void
  onClickTag: OnClickTag
}

const MainPageContext = createContext<MainPageContext>({
  bookmarks: [],
  // currentTag: null,
  selectedTags: [],
  setSelectedTags() {},
  onClickTag() {},
})

export const MainPageProvider = MainPageContext.Provider

export function useMainPageContext() {
  return useContext(MainPageContext)
}
