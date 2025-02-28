import { auth } from '@/lib/auth'
import { PageRoutes } from '@cfg'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import AdminNav from './components/UserNav'

export const metadata: Metadata = {
  title: '个人空间',
}

export default async function AdminLayout(props: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    redirect(PageRoutes.LOGIN)
  }

  return (
    <>
      <AdminNav user={session.user} />
      {props.children}
    </>
  )
}
