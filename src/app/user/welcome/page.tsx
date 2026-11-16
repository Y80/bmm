import { ReButton } from '@/components/re-export'
import { auth } from '@/lib/auth'
import { IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn } from '@heroui/react'

const LINKS = [
  { label: '新建书签', href: PageRoutes.User.bookmarkSlug('new') },
  { label: '新建标签', href: PageRoutes.User.tagSlug('new') },
  { label: '书签列表', href: PageRoutes.User.bookmarkSlug('list') },
  { label: '标签列表', href: PageRoutes.User.tagSlug('list') },
]

export const metadata = {
  title: '欢迎使用',
}

export default async function Page() {
  const session = await auth()

  return (
    <div className="xs:px-0 mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl leading-tight font-semibold break-words">
        {session?.user.name}，欢迎使用 {WEBSITE_NAME}
      </h1>
      <div className="max-xs:grid-cols-1 grid grid-cols-2 gap-4">
        {LINKS.map((link, idx) => (
          <ReButton
            key={link.label}
            href={link.href}
            size="lg"
            color={idx === 0 ? 'primary' : 'default'}
            variant={idx === 0 ? 'solid' : 'flat'}
            className="h-16 w-full justify-start px-5 text-base"
          >
            <span
              className={cn(
                'text-2xl',
                link.label.includes('书签') ? IconNames.Tabler.BOOKMARK : IconNames.Tabler.TAG
              )}
            />
            <span>{link.label}</span>
          </ReButton>
        ))}
        <ReButton
          href={PageRoutes.User.UPLOAD}
          size="lg"
          variant="bordered"
          className="max-xs:col-span-1 col-span-2 min-h-12"
        >
          <span className={cn(IconNames.Huge.IMPORT, 'text-xl')} />
          <span>导入浏览器书签</span>
        </ReButton>
      </div>
    </div>
  )
}
