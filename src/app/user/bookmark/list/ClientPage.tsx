'use client'

import BookmarkListPage from '@/components/BookmarkListPage'
import { useUserContext } from '../../ctx'

export default function ClientPage() {
  const { tags, totalBookmarks } = useUserContext()

  return <BookmarkListPage tags={tags} totalBookmarks={totalBookmarks} />
}
