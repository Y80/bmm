'use client'

import { actGetAllPublicTags, actTotalPublicBookmarks } from '@/actions'
import { runAction } from '@/utils'
import { useSetState } from 'ahooks'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

interface AdminContextType {
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
type ContextValuePart = Pick<AdminContextType, 'tags' | 'totalBookmarks'>

const AdminContext = createContext<AdminContextType | null>(null)

export function useAdminContext() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('usePublicContext() must be used within a GlobalContextProvider')
  return ctx
}

export function AdminProvider(props: PropsWithChildren<ContextValuePart>) {
  const [state, setState] = useSetState({
    tags: props.tags,
    totalBookmarks: props.totalBookmarks,
  })

  const ctxValue = useMemo<AdminContextType>(() => {
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

  return <AdminContext.Provider value={ctxValue}>{props.children}</AdminContext.Provider>
}
