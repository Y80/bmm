import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { Metadata } from 'next/types'
import PublicHomeBody from '../components/PublicHomeBody'

export const metadata: Metadata = {
  title: '随便看看',
}

export default async function Page() {
  const res = await PublicBookmarkController.random()
  return <PublicHomeBody bookmarks={res.list} />
}
