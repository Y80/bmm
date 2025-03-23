'use client'

import { HomeBody } from '@/components'
import { useUserContext } from '../ctx'

interface Props {
  bookmarks: SelectBookmark[]
  searchedTotalBookmarks?: number
}

export default function UserHomeBody(props: Props) {
  const { tags, totalBookmarks } = useUserContext()
  return (
    <HomeBody
      totalBookmarks={totalBookmarks}
      tags={tags}
      bookmarks={props.bookmarks}
      searchedTotalBookmarks={props.searchedTotalBookmarks}
    />
  )
}
