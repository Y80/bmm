import { UserBookmarkController } from '@/controllers'
import UserHomeBody from './components/UserHomeBody'

export default async function Page() {
  const res = await UserBookmarkController.findMany()

  return <UserHomeBody bookmarks={res.list} />
}
