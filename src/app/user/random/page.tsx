import { UserBookmarkController } from '@/controllers'
import { Metadata } from 'next/types'
import UserHomeBody from '../components/UserHomeBody'

export const metadata: Metadata = {
  title: '随便看看',
}

export default async function Page() {
  const res = await UserBookmarkController.random()
  return <UserHomeBody bookmarks={res.list} />
}
