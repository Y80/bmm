import { PublicAndUserNavbar } from '@/components/PublicAndUserNavBar'
import { UserBookmarkController, UserTagController } from '@/controllers'
import { auth } from '@/lib/auth'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { UserContextProvider } from './ctx'

export const generateMetadata = async () => {
  const session = await auth()
  const userName = session?.user.name || ''
  return {
    title: {
      default: '个人空间 - ' + userName,
      template: '%s - ' + userName,
    },
  }
}

export default async function UserLayout(props: PropsWithChildren) {
  const session = await auth()
  if (!session?.user) {
    redirect(PageRoutes.LOGIN)
  }

  const [tags, totalBookmarks] = await Promise.all([
    UserTagController.getAll(),
    UserBookmarkController.total(),
  ])

  return (
    <UserContextProvider tags={tags} totalBookmarks={totalBookmarks}>
      <PublicAndUserNavbar tags={tags} totalBookmarks={totalBookmarks} />
      <div className="h-screen pt-16">{props.children}</div>
    </UserContextProvider>
  )
}
