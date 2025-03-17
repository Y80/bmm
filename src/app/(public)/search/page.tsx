'use serve'

import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import CommonIndexPage from '../components/CommonIndexPage'

export const generateMetadata: GenerateMetadata = (props) => {
  return { title: `${props.searchParams.keyword as string}的搜索结果` }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword || ''

  if (!keyword.length || Array.isArray(keyword)) {
    redirect(PageRoutes.INDEX)
  }

  const res = await PublicBookmarkController.search(keyword)

  return <CommonIndexPage bookmarks={res.list} />
}
