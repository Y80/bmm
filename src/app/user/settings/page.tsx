import { auth } from '@/lib/auth'
import ClientPage from './ClientPage'

export const metadata = {
  title: '个人资料',
}

export default async function Page() {
  const session = await auth()

  return (
    <ClientPage
      user={{
        name: session?.user.name || '',
        image: session?.user.image || '',
        email: session?.user.email || '',
      }}
    />
  )
}
