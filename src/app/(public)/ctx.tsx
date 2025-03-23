'use client'

import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export interface PublicContextType {
  /** 所有的 publicTags  */
  tags: SelectTag[]
  /** publicBookmarks 个数 */
  totalBookmarks: number
}
type ContextValuePart = Pick<PublicContextType, 'tags' | 'totalBookmarks'>

const PublicContext = createContext<PublicContextType | null>(null)

export function usePublicContext() {
  const ctx = useContext(PublicContext)
  if (!ctx) throw new Error('usePublicContext() must be used within a GlobalContextProvider')
  return ctx
}

export function PublicProvider(props: PropsWithChildren<ContextValuePart>) {
  const ctxValue = useMemo<PublicContextType>(() => {
    return {
      tags: props.tags,
      totalBookmarks: props.totalBookmarks,
    }
  }, [props.tags, props.totalBookmarks])

  return <PublicContext.Provider value={ctxValue}>{props.children}</PublicContext.Provider>
}
