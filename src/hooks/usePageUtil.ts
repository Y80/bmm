import { PageRoutes } from '@cfg'
import { useSetState } from 'ahooks'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function usePageUtil() {
  const [state, setState] = useSetState({
    isAdminSpace: false,
    isUserSpace: false,
  })
  const pathname = usePathname()
  useEffect(() => {
    setState({
      isAdminSpace: pathname.startsWith(PageRoutes.Admin.INDEX),
      isUserSpace: pathname.startsWith(PageRoutes.User.INDEX),
    })
  }, [pathname, setState])
  return state
}
