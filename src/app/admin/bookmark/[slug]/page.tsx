'use client'

import { actQueryPublicBookmark } from '@/actions'
import { useGlobalContext } from '@/app/ctx'
import BookmarkSlugPage, { BookmarkSlugPageProps } from '@/components/BookmarkSlugPage'
import useSlug from '@/hooks/useSlug'
import { runAction } from '@/utils'
import { useEffect, useState } from 'react'

export default function BookmarkSlug() {
  const [bookmark, setBookmark] = useState<SelectBookmark | null>(null)
  const slug = useSlug()
  const { tags, totalBookmarks, updateTotalBookmarks } = useGlobalContext()

  useEffect(() => {
    if (slug.number === null) return
    runAction(actQueryPublicBookmark({ id: slug.number })).then((res) => {
      res.data && setBookmark(res.data)
    })
  }, [slug.number])

  const props: BookmarkSlugPageProps = {
    tags,
    bookmark,
    afterSave() {
      updateTotalBookmarks(totalBookmarks + 1)
    },
  }

  return <BookmarkSlugPage {...props} />
}
