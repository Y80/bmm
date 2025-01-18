'use serve'

import MainPage from '@/components/MainPage'
import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { GenerateMetadata, RSCPageProps } from '@/types'
import { mergeWebsiteTitle } from '@/utils'
import { redirect } from 'next/navigation'

export const generateMetadata: GenerateMetadata = (props) => {
  return { title: mergeWebsiteTitle(`${props.searchParams.keyword as string}的搜索结果`) }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword || ''

  if (!keyword.length || Array.isArray(keyword)) {
    redirect('/')
  }

  const res = await PublicBookmarkController.search(keyword)

  return <MainPage bookmarks={res.list} />
}
