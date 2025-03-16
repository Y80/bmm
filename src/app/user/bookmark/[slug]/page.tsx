'use client'

import { actQueryUserBookmark } from '@/actions'
import BookmarkSlugPage, { BookmarkSlugPageProps } from '@/components/BookmarkSlugPage'
import { useSlug } from '@/hooks'
import { runAction } from '@/utils'
import { useEffect, useState } from 'react'
import { useUserContext } from '../../ctx'

export default function BookmarkSlug() {
  const slug = useSlug()
  const { tags, totalBookmarks, updateTotalBookmarks } = useUserContext()
  const [bookmark, setBookmark] = useState<SelectBookmark | null>(null)

  useEffect(() => {
    if (slug.number === null) return
    runAction(actQueryUserBookmark({ id: slug.number }), {
      onOk: (data) => setBookmark(data),
    })
  }, [slug.number])

  const props: BookmarkSlugPageProps = {
    tags,
    bookmark,
    afterSave: () => updateTotalBookmarks(totalBookmarks + 1),
  }

  return <BookmarkSlugPage {...props} />
}
