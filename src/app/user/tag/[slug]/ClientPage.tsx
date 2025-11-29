'use client'

import { actInsertUserTag, actUpdateUserTag } from '@/actions'
import { useUserContext } from '@/app/user/ctx'
import TagSlugPage, { TagSlugPageProps } from '@/components/TagSlugPage'
import { useSlug } from '@/hooks'
import { runAction } from '@/utils/client'
import { PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function ClientPage() {
  const router = useRouter()
  const { tags, updateTags } = useUserContext()
  const slug = useSlug()

  const props: TagSlugPageProps = {
    tags,
    async save(tag) {
      const task = slug.isNew
        ? runAction(actInsertUserTag(tag))
        : runAction(actUpdateUserTag({ ...tag, id: slug.number! }))
      const { ok } = await task
      if (!ok) return
      addToast({ color: 'success', title: slug.isNew ? '标签已创建' : '标签已更新' })
      router.push(PageRoutes.User.tagSlug('list'))
      await updateTags()
    },
  }

  return <TagSlugPage {...props} />
}
