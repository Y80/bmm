import MainPage from '@/components/MainPage'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: '最近更新',
}

export default async function Page() {
  const res = await PublicBookmarkController.recent()
  return <MainPage bookmarks={res.list} />
}
