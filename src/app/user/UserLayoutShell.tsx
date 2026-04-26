'use client'

import { PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

import AdminNav from '@/app/admin/components/AdminNav'
import { PublicAndUserNavbar } from '@/components/PublicAndUserNavBar'
import { PageRoutes, USER_CMS_NAV_LINKS } from '@cfg'

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

export default function UserLayoutShell(props: UserLayoutShellProps) {
  const pathname = usePathname()
  const session = useSession()
  const showCmsLayout = isUserCmsPath(pathname)
  const userName = session.data?.user?.name || '用户'
  const userImage = session.data?.user?.image || null
  const userEmail = session.data?.user?.email || ''

  if (showCmsLayout) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.08),transparent_34%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(15,23,42,0.96))]">
        <div className="flex min-h-screen">
          <AdminNav
            links={USER_CMS_NAV_LINKS}
            brandHref={PageRoutes.User.INDEX}
            mode="user"
            userName={userName}
            userImage={userImage}
            userEmail={userEmail}
          />
          <main className="min-w-0 flex-1 px-4 pb-5 pt-20 xs:px-6 xs:py-6">
            <div className="mx-auto w-full max-w-7xl">{props.children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicAndUserNavbar tags={props.tags} totalBookmarks={props.totalBookmarks} />
      <div className="h-screen pt-16">{props.children}</div>
    </>
  )
}
