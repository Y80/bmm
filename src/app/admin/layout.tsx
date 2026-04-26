import { PublicBookmarkController, PublicTagController } from '@/controllers'
import UserController from '@/controllers/User.controller'
import { auth } from '@/lib/auth'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import AdminNav from './components/AdminNav'
import { AdminProvider } from './ctx'

export const metadata: Metadata = {
  title: {
    default: '后台数据管理 - ' + WEBSITE_NAME + ' CMS',
    template: '%s - ' + WEBSITE_NAME + ' CMS',
  },
}

export default async function AdminLayout(props: PropsWithChildren) {
  const session = await auth()

  if (!session) {
    redirect(PageRoutes.LOGIN)
  }

  if (!session.user.isAdmin) {
    redirect(PageRoutes.FORBIDDEN)
  }

  const [tags, total, totalUsers] = await Promise.all([
    PublicTagController.getAll(),
    PublicBookmarkController.total(),
    UserController.count(),
  ])

  return (
    <AdminProvider tags={tags} totalBookmarks={total} totalUsers={totalUsers}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.08),transparent_34%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(15,23,42,0.96))]">
        <div className="flex min-h-screen">
          <AdminNav />
          <main className="min-w-0 flex-1 px-4 pb-5 pt-20 xs:px-6 xs:py-6">
            <div className="mx-auto w-full max-w-7xl">{props.children}</div>
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}
