import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { createContext, useContext } from 'react'

export interface GlobalContextType {
  tags: SelectPublicTag[]
  totalBookmarks: number
  mutateTags(tags: SelectPublicTag[]): void
  refreshTags(): Promise<void>
}

const GlobalContext = createContext<GlobalContextType>({
  tags: [],
  totalBookmarks: 0,
  mutateTags() {},
  async refreshTags() {},
})

export const GlobalContextProvider = GlobalContext.Provider

export function useGlobalContext() {
  return useContext(GlobalContext)
}
