import { Metadata } from 'next'
import ClientPage from './ClientPage'

export const metadata: Metadata = {
  title: '标签列表',
}

export default function Page() {
  return <ClientPage />
}
