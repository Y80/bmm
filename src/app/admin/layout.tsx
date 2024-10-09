import { auth } from '@/lib/auth'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import AdminNav from './components/AdminNav'

export const metadata: Metadata = {
  title: '后台数据管理 | ' + WEBSITE_NAME + ' CMS',
}

export default async function AdminLayout(props: PropsWithChildren) {
  const session = await auth()

  if (!session) {
    redirect(PageRoutes.LOGIN)
  }

  if (!session.user?.isAdmin) {
    redirect(PageRoutes.FORBIDDEN)
  }

  return (
    <>
      <AdminNav />
      {props.children}
    </>
  )
}
