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
      <div className="min-h-screen bg-default-50 dark:bg-background">
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
