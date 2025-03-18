import { pageSpace } from '@/utils'
import { useSetState } from 'ahooks'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function usePageUtil() {
  const pathname = usePathname()
  const [state, setState] = useSetState({
    isAdminSpace: null as null | boolean,
    isUserSpace: null as null | boolean,
  })
  useEffect(() => {
    const space = pageSpace(pathname)
    setState({
      isAdminSpace: space.isAdmin,
      isUserSpace: space.isUser,
    })
  }, [pathname, setState])
  return state
}
