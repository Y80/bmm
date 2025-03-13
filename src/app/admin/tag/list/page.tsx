'use client'

import { useGlobalContext } from '@/app/ctx'
import TagListPage, { TagListPageProps } from '@/components/TagListPage'
import { deletePublicTag, updatePublicTag } from '@/lib/actions'
import { runAction } from '@/utils'

export default function Page() {
  const { tags, mutateTags, refreshTags } = useGlobalContext()

  const props: TagListPageProps = {
    tags,
    refreshTags,
    removeTag: async (tag) => {
      await runAction(deletePublicTag({ id: tag.id }))
      refreshTags()
    },
    changeTag: async (tag) => {
      const idx = tags.findIndex((e) => e.id === tag.id)
      if (idx === -1) return
      tags[idx] = tag
      mutateTags([...tags])
      await runAction(updatePublicTag(tag))
      refreshTags()
    },
  }

  return <TagListPage {...props} />
}
