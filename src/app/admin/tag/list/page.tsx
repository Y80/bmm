'use client'

import TagListPage, { TagListPageProps } from '@/components/TagListPage'
import { deletePublicTag, updatePublicTag } from '@/lib/actions'
import { resolveAction } from '@/utils'
import { useAdminContext } from '@app/admin/ctx'

export default function Page() {
  const { tags, mutateTags, refreshTags } = useAdminContext()

  const props: TagListPageProps = {
    tags,
    refreshTags,
    removeTag: async (tag) => {
      await resolveAction(deletePublicTag({ id: tag.id }))
      refreshTags()
    },
    changeTag: async (tag) => {
      const idx = tags.findIndex((e) => e.id === tag.id)
      if (idx === -1) return
      tags[idx] = tag
      mutateTags([...tags])
      await resolveAction(updatePublicTag(tag))
      refreshTags()
    },
  }

  return <TagListPage {...props} />
}
