'use client'

import { actGetAllUserTags, actTotalUserBookmarks } from '@/actions'
import { runAction } from '@/utils'
import { useSetState } from 'ahooks'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

type ContextValuePart = Pick<UserContextType, 'tags' | 'totalBookmarks'>
interface UserContextType {
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

const UserContext = createContext<UserContextType | null>(null)

export function useUserContext() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used within an UserContextProvider')
  return ctx
}

type Props = PropsWithChildren<Pick<UserContextType, 'tags' | 'totalBookmarks'>>
export function UserContextProvider(props: Props) {
  const [state, setState] = useSetState({
    tags: props.tags,
    totalBookmarks: props.totalBookmarks,
  })

  const value = useMemo<UserContextType>(() => {
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
        const res = await runAction(actGetAllUserTags())
        setState({ tags: res.ok ? res.data : oldValue })
      },
      updateTotalBookmarks: async (value: number) => {
        const oldValue = state.totalBookmarks
        setState({ totalBookmarks: value })
        const res = await runAction(actTotalUserBookmarks())
        setState({ totalBookmarks: res.ok ? res.data : oldValue })
      },
    }
  }, [state, setState])

  return <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
}
