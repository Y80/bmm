import UploadPage from '@/components/UploadPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '导入浏览器书签',
}

export default function Page() {
  return <UploadPage />
}
