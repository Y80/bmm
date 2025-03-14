import { UserBookmarkController, UserTagController } from '@/controllers'
import { auth } from '@/lib/auth'
import { PageRoutes } from '@cfg'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import Nav from './components/UserNav'
import { UserContextProvider } from './ctx'

export const metadata: Metadata = {
  title: '个人空间',
}

export default async function UserLayout(props: PropsWithChildren) {
  const session = await auth()

  if (!session?.user) {
    console.log('UserLayout: no session')
    redirect(PageRoutes.LOGIN)
  }

  const [tags, totalBookmarks] = await Promise.all([
    UserTagController.getAll(),
    UserBookmarkController.total(),
  ])

  return (
    <UserContextProvider tags={tags} totalBookmarks={totalBookmarks}>
      <Nav user={session.user} />
      {props.children}
    </UserContextProvider>
  )
}
