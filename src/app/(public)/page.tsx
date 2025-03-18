import { PublicBookmarkController } from '@/controllers'
import PublicHomeBody from './components/PublicHomeBody'

export default async function Page() {
  const res = await PublicBookmarkController.findMany()
  return <PublicHomeBody bookmarks={res.list} />
}
