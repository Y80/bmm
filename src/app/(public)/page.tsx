import { PublicBookmarkController } from '@/controllers'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import PublicHomeBody from './components/PublicHomeBody'

export default async function Page() {
  const res = await PublicBookmarkController.findMany()
  if (!res.total) {
    return redirect(PageRoutes.Public.WELCOME)
  }
  return <PublicHomeBody bookmarks={res.list} />
}
