'use client'

import { HomeBody } from '@/components'
import { useUserContext } from '../ctx'

interface Props {
  bookmarks: SelectBookmark[]
}

export default function UserHomeBody(props: Props) {
  const { tags, totalBookmarks } = useUserContext()
  return <HomeBody totalBookmarks={totalBookmarks} tags={tags} bookmarks={props.bookmarks} />
}
