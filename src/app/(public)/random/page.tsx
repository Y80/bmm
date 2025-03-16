import MainPage from '@/components/MainPage'
import { PublicTagController } from '@/controllers'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: '随便看看',
}

export default async function Page() {
  const [res, tags] = await Promise.all([
    PublicBookmarkController.random(),
    PublicTagController.getAll(),
  ])
  return <MainPage tags={tags} bookmarks={res.list} />
}
