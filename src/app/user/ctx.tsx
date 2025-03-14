'use client'

import { actGetAllUserTags, actTotalUserBookmarks } from '@/actions'
import { runAction } from '@/utils'
import { useSetState } from 'ahooks'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { GlobalContextType } from '../ctx'

interface UserContextType extends GlobalContextType {}

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
