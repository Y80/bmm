import { UserBookmarkController } from '@/controllers'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'

import UserHomeBody from '../components/UserHomeBody'

export const metadata = {
  title: '个人空间',
}

export default async function Page() {
  const res = await UserBookmarkController.findMany()
  if (!res.total) {
    redirect(PageRoutes.User.WELCOME)
  }

  return (
    <div className="h-full overflow-auto">
      <UserHomeBody bookmarks={res.list} />
    </div>
  )
}
