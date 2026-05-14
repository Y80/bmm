import CmsLayout from '@/components/CmsLayout'
import { PublicBookmarkController, PublicTagController } from '@/controllers'
import UserController from '@/controllers/User.controller'
import { auth } from '@/lib/auth'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
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
      <CmsLayout mode="admin">{props.children}</CmsLayout>
    </AdminProvider>
  )
}
