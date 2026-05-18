'use client'

import BookmarkListPage from '@/components/BookmarkListPage'
import { useUserContext } from '../../ctx'

export default function ClientPage() {
  const { tags } = useUserContext()

  return <BookmarkListPage tags={tags} />
}
