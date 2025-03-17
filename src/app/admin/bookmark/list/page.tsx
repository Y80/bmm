'use client'

import BookmarkListPage, { BookmarkListPageProps } from '@/components/BookmarkListPage'
import { useAdminContext } from '../../ctx'

export default function Page() {
  const { tags, totalBookmarks } = useAdminContext()

  const props: BookmarkListPageProps = {
    tags,
    totalBookmarks,
  }

  return <BookmarkListPage {...props} />
}
