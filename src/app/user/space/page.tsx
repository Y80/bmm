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
      <UserHomeBody
        bookmarks={res.list}
        header={
          <div className="pt-6 pb-3">
            <h1 className="my-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              个人空间
            </h1>
          </div>
        }
      />
    </div>
  )
}
