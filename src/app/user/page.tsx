import { Metadata } from 'next'

import ClientHomePage from './ClientHomePage'

export const metadata: Metadata = {
  title: '内容管理',
}

export default function Page() {
  return <ClientHomePage />
}
