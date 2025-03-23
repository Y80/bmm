import { Metadata } from 'next'
import ClientPage from './ClientPage'

export const metadata: Metadata = {
  title: '编辑标签',
}

export default function Page() {
  return <ClientPage />
}
