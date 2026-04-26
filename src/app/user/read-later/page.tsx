import { UserReadLaterController } from '@/controllers'
import { findManyReadLaterItemsSchema } from '@/controllers/schemas'

import ClientPage from './ClientPage'

export const metadata = {
  title: '稍后阅读',
}

export default async function Page() {
  const [unread, read] = await Promise.all([
    UserReadLaterController.findMany(findManyReadLaterItemsSchema.parse({ status: 'unread' })),
    UserReadLaterController.findMany(findManyReadLaterItemsSchema.parse({ status: 'read' })),
  ])

  return <ClientPage initialUnreadItems={unread.list} initialReadItems={read.list} />
}
