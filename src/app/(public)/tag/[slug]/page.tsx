'use server'

import MainPage from '@/components/MainPage'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { SelectPublicTag } from '@/db'
import { GenerateMetadata, RSCPageProps } from '@/types'
import { mergeWebsiteTitle } from '@/utils'

export const generateMetadata: GenerateMetadata<{ slug: string }> = (props) => {
  return {
    title: mergeWebsiteTitle(`「${decodeURIComponent(props.params.slug)}」相关的书签`),
  }
}

export default async function Page(props: RSCPageProps) {
  const tagNames = decodeURIComponent(props.params.slug).split('+')
  const tags = await PublicTagController.getAll()
  const tagIds: SelectPublicTag['id'][] = []
  tagNames.forEach((tagName) => {
    const tag = tags.find((tag) => tag.name === tagName)
    tag && tagIds.push(tag.id)
  })
  const bookmarks = tagIds.length
    ? (await PublicBookmarkController.findMany(findManyBookmarksSchema.parse({ tagIds }))).list
    : []

  return <MainPage bookmarks={bookmarks} />
}
