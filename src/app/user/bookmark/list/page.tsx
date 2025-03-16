'use client'

import BookmarkListPage, { BookmarkListPageProps } from '@/components/BookmarkListPage'
import { useUserContext } from '../../ctx'

export default function Page() {
  const { tags, totalBookmarks } = useUserContext()

  const props: BookmarkListPageProps = {
    tags,
    totalBookmarks,
  }

  return <BookmarkListPage {...props} />
}
