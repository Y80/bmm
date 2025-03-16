import MainPage from '@/components/MainPage'
import { UserBookmarkController, UserTagController } from '@/controllers'
import { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: '随便看看',
}

export default async function Page() {
  const [res, tags] = await Promise.all([
    UserBookmarkController.random(),
    UserTagController.getAll(),
  ])
  return <MainPage tags={tags} bookmarks={res.list} />
}
