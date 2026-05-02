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
    <div className="flex-center xs:w-lg mx-auto -mt-[10vh] h-full flex-col">
      <h1 className="max-xs:mt-20 mb-12 text-3xl">
        👋 {session?.user.name}，欢迎使用 {WEBSITE_NAME}
      </h1>
      <div className="max-xs:grid-cols-1 grid grid-cols-2 gap-4">
        {LINKS.map((link, idx) => (
          <ReButton
            key={link.label}
            href={link.href}
            size="lg"
            className={cn(
              'group relative h-24 w-60 bg-linear-to-br text-xl text-gray-200 transition-all! hover:saturate-150',
              idx === 0 && 'from-rose-500 to-rose-700',
              idx === 1 && 'from-blue-500 to-blue-700',
              idx === 2 && 'from-lime-500 to-lime-700',
              idx === 3 && 'from-purple-500 to-purple-700'
            )}
          >
            <span
              className={cn(
                'text-2xl',
                link.label.includes('书签') ? IconNames.Tabler.BOOKMARK : IconNames.Tabler.TAG
              )}
            />
            <span>{link.label}</span>
            <span
              className={cn(
                'absolute top-1 right-1 text-5xl opacity-30 transition group-hover:opacity-80',
                link.label.includes('新建') ? IconNames.Tabler.PLUS : IconNames.Tabler.LIST
              )}
            />
          </ReButton>
        ))}
        <ReButton
          href={PageRoutes.User.UPLOAD}
          size="lg"
          className="bg-foreground text-background max-xs:col-span-1 max-xs:h-24 col-span-2 py-7"
        >
          <span className={cn(IconNames.Huge.IMPORT, 'text-xl')} />
          <span>导入浏览器书签</span>
        </ReButton>
      </div>
    </div>
  )
}
