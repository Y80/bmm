'use client'

import BookmarkSlugPage, { BookmarkSlugPageProps } from '@/components/BookmarkSlugPage'
import { useAdminContext } from '@/app/admin/ctx'
import { usePathname } from 'next/navigation'

export default function BookmarkSlug() {
  const pathname = usePathname()
  const { tags, totalBookmarks, updateTotalBookmarks, updateTags } = useAdminContext()

  const props: BookmarkSlugPageProps = {
    tags,
    refreshTags: updateTags,
    afterSave: () => updateTotalBookmarks(totalBookmarks + 1),
  }

  return <BookmarkSlugPage key={pathname} {...props} />
}
