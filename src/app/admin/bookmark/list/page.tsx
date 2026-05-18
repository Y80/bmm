'use client'

import BookmarkListPage, { BookmarkListPageProps } from '@/components/BookmarkListPage'
import { useAdminContext } from '../../ctx'

export default function Page() {
  const { tags } = useAdminContext()

  return <BookmarkListPage tags={tags} />
}
