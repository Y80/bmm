'use client'

import BookmarkSlugPage, { BookmarkSlugPageProps } from '@/components/BookmarkSlugPage'
import { useUserContext } from '@/app/user/ctx'
import { usePathname } from 'next/navigation'

export default function ClientPage() {
  const pathname = usePathname()
  const { tags, totalBookmarks, updateTotalBookmarks, updateTags } = useUserContext()

  const props: BookmarkSlugPageProps = {
    tags,
    refreshTags: updateTags,
    afterSave: () => updateTotalBookmarks(totalBookmarks + 1),
  }

  return <BookmarkSlugPage key={pathname} {...props} />
}
