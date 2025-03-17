import { UserBookmarkController } from '@/controllers'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import UserHomeBody from './components/UserHomeBody'

export default async function Page() {
  const params = findManyBookmarksSchema.parse({ page: 1 })
  const res = await UserBookmarkController.findMany(params)

  return <UserHomeBody bookmarks={res.list} />
}
