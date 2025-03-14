'use client'

import { actInsertUserTag, actUpdateUserTag } from '@/actions'
import TagSlugPage, { TagSlugPageProps } from '@/components/TagSlugPage'
import useSlug from '@/hooks/useSlug'
import { runAction } from '@/utils'
import { PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '../../ctx'

export default function Page() {
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
      router.push(PageRoutes.User.TAG_LIST)
      await updateTags()
    },
  }

  return <TagSlugPage {...props} />
}
