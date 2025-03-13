import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { getAllPublicTags } from '@/lib/actions'
import { resolveAction } from '@/utils'
import { useSetState } from 'ahooks'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export interface AdminContextType {
  tags: SelectPublicTag[]
  totalBookmarks: number
  mutateTags(tags: SelectPublicTag[]): void
  refreshTags(): Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function useAdminContext() {
  const ctx = useContext(AdminContext)
  if (!ctx) {
    throw new Error('useAdminContext must be used within an AdminContextProvider')
  }
  return ctx
}

type Props = PropsWithChildren<Pick<AdminContextType, 'tags' | 'totalBookmarks'>>
export function AdminContextProvider(props: Props) {
  const [state, setState] = useSetState({
    tags: props.tags,
    totalBookmarks: props.totalBookmarks,
  })

  const value = useMemo<AdminContextType>(() => {
    return {
      ...state,
      mutateTags(tags) {
        setState({ tags })
      },
      async refreshTags() {
        const res = await resolveAction(getAllPublicTags())
        res.ok && setState({ tags: res.data })
      },
    }
  }, [state, setState])

  return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>
}
