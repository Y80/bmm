'use client'

import { actDeletePublicTag, actUpdatePublicTag } from '@/actions'
import TagListPage, { TagListPageProps } from '@/components/TagListPage'
import { runAction } from '@/utils/client'
import { useAdminContext } from '../../ctx'

export default function Page() {
  const { tags, setCtxValue, updateTags } = useAdminContext()

  const props: TagListPageProps = {
    tags,
    refreshTags: updateTags,
    removeTag: async (tag) => {
      await runAction(actDeletePublicTag({ id: tag.id }), {
        onOk: () => updateTags(),
      })
    },
    changeTag: async (tag) => {
      const idx = tags.findIndex((e) => e.id === tag.id)
      if (idx === -1) return
      tags[idx] = tag
      setCtxValue((state) => ({ ...state, tags: [...tags] }))
      await runAction(actUpdatePublicTag(tag), { onOk: () => updateTags() })
    },
  }

  return <TagListPage {...props} />
}
