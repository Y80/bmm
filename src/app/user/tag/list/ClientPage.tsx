'use client'

import { actDeleteUserTag, actUpdateUserTag } from '@/actions'
import { useUserContext } from '@/app/user/ctx'
import TagListPage, { TagListPageProps } from '@/components/TagListPage'
import { runAction } from '@/utils'

export default function ClientPage() {
  const { tags, setCtxValue, updateTags } = useUserContext()

  const props: TagListPageProps = {
    tags,
    refreshTags: updateTags,
    removeTag: async (tag) => {
      await runAction(actDeleteUserTag({ id: tag.id }), { onOk: () => updateTags() })
    },
    changeTag: async (tag) => {
      const idx = tags.findIndex((e) => e.id === tag.id)
      if (idx === -1) return
      tags[idx] = tag
      setCtxValue((state) => ({ ...state, tags: [...tags] }))
      await runAction(actUpdateUserTag(tag), { onOk: () => updateTags() })
    },
  }

  return <TagListPage {...props} />
}
