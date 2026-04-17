'use client'

import { useSession } from 'next-auth/react'

import CmsHomePage from '@/components/CmsHomePage'
import { useAdminContext } from './ctx'

export default function Page() {
  const session = useSession()
  const { tags, totalBookmarks, totalUsers } = useAdminContext()

  return (
    <CmsHomePage
      scope="admin"
      userName={session.data?.user?.name || '管理员'}
      tags={tags}
      totalBookmarks={totalBookmarks}
      totalUsers={totalUsers}
    />
  )
}
