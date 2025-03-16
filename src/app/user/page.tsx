'use client'

import MainPage from '@/components/MainPage'
import { useUserContext } from './ctx'

export default function Page() {
  const { tags } = useUserContext()

  return <MainPage tags={tags} />
}
