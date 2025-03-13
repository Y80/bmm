'use client'

import { useGlobalContext } from '@/app/ctx'
import BookmarkListPage, { BookmarkListPageProps } from '@/components/BookmarkListPage'

export default function Page() {
  const { tags, totalBookmarks } = useGlobalContext()

  const props: BookmarkListPageProps = {
    tags,
    totalBookmarks,
  }

  return <BookmarkListPage {...props} />
}
