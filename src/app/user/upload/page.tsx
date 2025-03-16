import UploadPage from '@/components/UploadPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '上传书签 - BMM',
}

export default function Page() {
  return <UploadPage />
}
