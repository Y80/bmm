import MainPage from '@/components/MainPage'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'

export default async function Page() {
  const res = await PublicBookmarkController.random()

  return <MainPage bookmarks={res.list} />
}
