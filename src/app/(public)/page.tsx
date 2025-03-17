import { PublicBookmarkController } from '@/controllers'
import CommonIndexPage from './components/CommonIndexPage'

export default async function Page() {
  const res = await PublicBookmarkController.findMany()
  return <CommonIndexPage bookmarks={res.list} />
}
