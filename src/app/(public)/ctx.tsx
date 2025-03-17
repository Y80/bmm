'use client'

import { actGetAllPublicTags, actTotalPublicBookmarks } from '@/actions'
import { runAction } from '@/utils'
import { PageRoutes } from '@cfg'
import { useSetState } from 'ahooks'
import { usePathname } from 'next/navigation'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export interface PublicContextType {
  /** 所有的 publicTags  */
  tags: SelectTag[]
  /** publicBookmarks 个数 */
  totalBookmarks: number
  setCtxValue(fn: (value: ContextValuePart) => ContextValuePart): void
  /** 立即更新标签，并重新请求获取书签 */
  updateTags(tags?: SelectTag[]): Promise<void>
  /** 立即变更并重新获取书签个数 */
  updateTotalBookmarks(value: number): Promise<void>
}
type ContextValuePart = Pick<PublicContextType, 'tags' | 'totalBookmarks'>

const PublicContext = createContext<PublicContextType | null>(null)

export function usePublicContext() {
  const ctx = useContext(PublicContext)
  if (!ctx) throw new Error('usePublicContext() must be used within a GlobalContextProvider')
  return ctx
}

export function PublicProvider(props: PropsWithChildren<ContextValuePart>) {
  const [state, setState] = useSetState({
    tags: props.tags,
    totalBookmarks: props.totalBookmarks,
  })
  const pathname = usePathname()
  // TODO
  if (!props.tags.length || !props.totalBookmarks) {
    if (pathname !== PageRoutes.LOGIN && !pathname.startsWith(PageRoutes.Admin.INDEX)) {
      // redirect(PageRoutes.LOGIN)
    }
  }

  const ctxValue = useMemo<PublicContextType>(() => {
    return {
      ...state,
      setCtxValue(fn) {
        setState((state) => fn(state))
      },
      async updateTags(tags) {
        if (tags) {
          tags = [...tags]
        }
        const oldValue = state.tags
        tags && setState({ tags })
        const res = await runAction(actGetAllPublicTags())
        setState({ tags: res.ok ? res.data : oldValue })
      },
      updateTotalBookmarks: async (value: number) => {
        const oldValue = state.totalBookmarks
        setState({ totalBookmarks: value })
        const res = await runAction(actTotalPublicBookmarks())
        setState({ totalBookmarks: res.ok ? res.data : oldValue })
      },
    }
  }, [state, setState])

  return <PublicContext.Provider value={ctxValue}>{props.children}</PublicContext.Provider>
}
