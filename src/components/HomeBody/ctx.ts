import { MouseEvent, createContext, useContext } from 'react'

type OnClickTag = (arg: { tag: SelectTag; isIntersected?: boolean; event?: MouseEvent }) => void

export interface HomeBodyContext {
  tags: SelectTag[]
  bookmarks: SelectBookmark[]
  // 当前选中的标签；如果有多个标签，则为交集模式搜索书签
  selectedTags: SelectTag[]
  setSelectedTags(tags: SelectTag[]): void
  onClickTag: OnClickTag
}

const HomeBodyContext = createContext<HomeBodyContext | null>(null)

export const HomeBodyProvider = HomeBodyContext.Provider

export function useHomePageContext() {
  const ctx = useContext(HomeBodyContext)
  if (!ctx) throw new Error('useHomePageContext 必须在 HomeBodyProvider 中使用')
  return ctx
}
