import MainPage from '@/components/MainPage'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'

export default async function Page() {
  const res = await PublicBookmarkController.findMany(findManyBookmarksSchema.parse({}))

  return <MainPage bookmarks={res.list} />
}
