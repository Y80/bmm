'use client'

import { useSession } from 'next-auth/react'

import CmsHomePage from '@/components/CmsHomePage'
import { useUserContext } from './ctx'

export default function ClientHomePage() {
  const session = useSession()
  const { tags, totalBookmarks } = useUserContext()

  return (
    <CmsHomePage
      scope="user"
      userName={session.data?.user?.name || '朋友'}
      tags={tags}
      totalBookmarks={totalBookmarks}
      hiddenStats={['主标签', '视觉配置']}
    />
  )
}
