import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'

export default function Page() {
  redirect(PageRoutes.Admin.bookmarkSlug('list'))
}
