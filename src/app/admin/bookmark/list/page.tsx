'use client'

import BookmarkListPage, { BookmarkListPageProps } from '@/components/BookmarkListPage'
import { useAdminContext } from '@app/admin/ctx'

export default function Page() {
  const { tags, totalBookmarks } = useAdminContext()

  const props: BookmarkListPageProps = {
    tags,
    totalBookmarks,
    target: 'public',
  }

  return <BookmarkListPage {...props} />
}
