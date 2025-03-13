'use client'

import { useGlobalContext } from '@/app/ctx'
import BookmarkSlugPage, { BookmarkSlugPageProps } from '@/components/BookmarkSlugPage'
import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import useSlug from '@/hooks/useSlug'
import http from '@/lib/http'
import { ApiRoutes, PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useUpdateEffect } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BookmarkSlug() {
  const [bookmark, setBookmark] = useState<SelectPublicBookmark | null>(null)
  const router = useRouter()
  const slug = useSlug()
  const { tags } = useGlobalContext()

  useUpdateEffect(() => {
    if (slug.number === null) return
    http.get(ApiRoutes.Public.BOOKMARK, { id: slug.number }).then(({ data, error }) => {
      if (error) return
      setBookmark(data)
    })
  }, [slug.number])

  const props: BookmarkSlugPageProps = {
    tags,
    bookmark,
    save: async (bookmark) => {
      const task = slug.isNew
        ? http.post(ApiRoutes.Public.BOOKMARK, bookmark)
        : http.patch(ApiRoutes.Public.BOOKMARK, bookmark)
      const { error } = await task
      if (error) return
      addToast({
        color: 'success',
        title: '操作成功',
        description: slug.isNew ? '书签已创建' : '书签已更新',
      })
      router.push(PageRoutes.Admin.BOOKMARK_LIST)
    },
  }

  return <BookmarkSlugPage {...props} />
}
