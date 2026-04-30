'use client'

import HomeBody from '@/components/HomeBody'
import { ReactNode } from 'react'
import { useUserContext } from '../ctx'

interface Props {
  bookmarks: SelectBookmark[]
  searchedTotalBookmarks?: number
  header?: ReactNode
}

export default function UserHomeBody(props: Props) {
  const { tags, totalBookmarks } = useUserContext()
  return (
    <HomeBody
      totalBookmarks={totalBookmarks}
      tags={tags}
      bookmarks={props.bookmarks}
      searchedTotalBookmarks={props.searchedTotalBookmarks}
      header={props.header}
    />
  )
}
