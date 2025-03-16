'use serve'

import MainPage from '@/components/MainPage'
import { PublicTagController } from '@/controllers'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { GenerateMetadata, RSCPageProps } from '@/types'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'

export const generateMetadata: GenerateMetadata = (props) => {
  return { title: `${props.searchParams.keyword as string}的搜索结果` }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword || ''

  if (!keyword.length || Array.isArray(keyword)) {
    redirect(PageRoutes.INDEX)
  }

  const [res, tags] = await Promise.all([
    PublicBookmarkController.search(keyword),
    PublicTagController.getAll(),
  ])

  return <MainPage bookmarks={res.list} tags={tags} />
}
