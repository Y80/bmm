'use serve'

import MainPage from '@/components/MainPage'
import { UserBookmarkController, UserTagController } from '@/controllers'
import { GenerateMetadata, RSCPageProps } from '@/types'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'

export const generateMetadata: GenerateMetadata = (props) => {
  return { title: `${props.searchParams.keyword as string}的搜索结果` }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword || ''

  if (!keyword.length || Array.isArray(keyword)) {
    redirect(PageRoutes.User.INDEX)
  }

  const [res, tags] = await Promise.all([
    UserBookmarkController.search(keyword),
    UserTagController.getAll(),
  ])

  return <MainPage bookmarks={res.list} tags={tags} />
}
