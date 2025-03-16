import { MouseEvent, createContext, useContext } from 'react'

type OnClickTag = (arg: { tag: SelectTag; isIntersected?: boolean; event?: MouseEvent }) => void

// selectedTags 和 /tag/$slug 相关数据流
// 进入 /tag/$slug 页面，根据解析设置 selectedTags

export interface MainPageContext {
  bookmarks: SelectBookmark[]
  // currentTag: null | SelectTag
  // 当前选中的标签。如果有多个标签，则为交集模式搜索书签
  selectedTags: SelectTag[]
  setSelectedTags(tags: SelectTag[]): void
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
