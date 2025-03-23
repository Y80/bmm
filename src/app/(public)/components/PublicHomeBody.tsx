'use client'

import HomeBody from '@/components/HomeBody'
import { usePublicContext } from '../ctx'

interface Props {
  bookmarks: SelectBookmark[]
  searchedTotalBookmarks?: number
}

export default function PublicHomeBody(props: Props) {
  const { tags, totalBookmarks } = usePublicContext()
  return (
    <HomeBody
      searchedTotalBookmarks={props.searchedTotalBookmarks}
      bookmarks={props.bookmarks}
      tags={tags}
      totalBookmarks={totalBookmarks}
    />
  )
}
