'use client'

import { actInsertPublicTag, actUpdatePublicTag } from '@/actions'
import TagSlugPage, { TagSlugPageProps } from '@/components/TagSlugPage'
import useSlug from '@/hooks/useSlug'
import { runAction } from '@/utils'
import { PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useAdminContext } from '../../ctx'

export default function Page() {
  const router = useRouter()
  const { tags, updateTags } = useAdminContext()
  const slug = useSlug()

  const props: TagSlugPageProps = {
    tags,
    async save(tag) {
      const task = slug.isNew
        ? runAction(actInsertPublicTag(tag))
        : runAction(actUpdatePublicTag({ ...tag, id: slug.number! }))
      const { ok } = await task
      if (!ok) return
      addToast({ color: 'success', title: slug.isNew ? '标签已创建' : '标签已更新' })
      router.push(PageRoutes.Admin.TAG_LIST)
      await updateTags()
    },
  }

  return <TagSlugPage {...props} />
}
