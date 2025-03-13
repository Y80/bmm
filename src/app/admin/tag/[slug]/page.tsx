'use client'

import { useGlobalContext } from '@/app/ctx'
import TagSlugPage, { TagSlugPageProps } from '@/components/TagSlugPage'
import useSlug from '@/hooks/useSlug'
import { insertPublicTag, updatePublicTag } from '@/lib/actions'
import { runAction } from '@/utils'
import { PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const { tags, refreshTags } = useGlobalContext()
  const slug = useSlug()

  const props: TagSlugPageProps = {
    tags,
    async save(tag) {
      if (!slug.number) return
      const task = slug.isNew
        ? runAction(insertPublicTag(tag))
        : runAction(updatePublicTag({ ...tag, id: slug.number }))
      const { ok } = await task
      if (!ok) return
      addToast({ color: 'success', title: slug.isNew ? '标签已创建' : '标签已更新' })
      router.push(PageRoutes.Admin.TAG_LIST)
      refreshTags()
    },
  }

  return <TagSlugPage {...props} />
}
