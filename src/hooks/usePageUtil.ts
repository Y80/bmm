import { pageSpace } from '@/utils'
import { useSetState } from 'ahooks'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function usePageUtil() {
  const pathname = usePathname()
  const [state, setState] = useSetState({
    isAdminSpace: null as null | boolean,
    isUserSpace: null as null | boolean,
    isPublicSpace: null as null | boolean,
  })
  useEffect(() => {
    const space = pageSpace(pathname)
    setState({
      isAdminSpace: space.isAdmin,
      isUserSpace: space.isUser,
      // 当前应用只有 3 个空间，因此可以这样判断
      isPublicSpace: !space.isAdmin && !space.isUser,
    })
  }, [pathname, setState])
  return state
}
