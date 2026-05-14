'use client'

import CmsLayoutShell from '@/components/CmsLayoutShell'
import { PublicAndUserNavbar } from '@/components/PublicAndUserNavBar'
import { PageRoutes, USER_CMS_NAV_LINKS } from '@cfg'
import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'

interface UserLayoutShellProps extends PropsWithChildren {
  tags: SelectTag[]
  totalBookmarks: number
}

function isUserCmsPath(pathname: string) {
  if (pathname === PageRoutes.User.INDEX) return true

  const nestedCmsPaths = [
    `${PageRoutes.User.PREFIX}/bookmark`,
    `${PageRoutes.User.PREFIX}/tag`,
    PageRoutes.User.READ_LATER,
    PageRoutes.User.SETTINGS,
    PageRoutes.User.UPLOAD,
  ]

  return nestedCmsPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))
}

/**
 * UserLayoutShell - User 布局壳
 *
 * 根据当前路径决定渲染 CMS 布局还是普通布局：
 * - CMS 路径：显示侧边栏导航（使用 CmsLayoutShell）
 * - 非 CMS 路径：显示顶部导航栏（PublicAndUserNavbar）
 */
export default function UserLayoutShell(props: UserLayoutShellProps) {
  const pathname = usePathname()
  const showCmsLayout = isUserCmsPath(pathname)

  if (showCmsLayout) {
    return <CmsLayoutShell>{props.children}</CmsLayoutShell>
  }

  return (
    <>
      <PublicAndUserNavbar tags={props.tags} totalBookmarks={props.totalBookmarks} />
      <div className="h-screen pt-16">{props.children}</div>
    </>
  )
}
