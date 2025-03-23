import { usePageUtil } from '@/hooks'
import { Assets, PageRoutes } from '@cfg'
import { Image, Link } from '@heroui/react'

interface Props {
  target: 'bookmark' | 'tag'
}

export default function EmptyListPlaceholder(props: Props) {
  const isTag = props.target === 'tag'
  const isAdminSpace = usePageUtil().isAdminSpace
  const space = isAdminSpace ? PageRoutes.Admin : PageRoutes.User
  return (
    <div className="my-24 flex-col flex-center">
      <Image isBlurred src={Assets.BOX_EMPTY_PNG} width={120} height={120} alt="empty" />
      <div className="mt-12 text-sm">
        暂无内容，立即
        <Link
          size="sm"
          className="group cursor-pointer"
          href={isTag ? space.tagSlug('new') : space.bookmarkSlug('new')}
        >
          &nbsp;新建{isTag ? '标签' : '书签'}
        </Link>
        &nbsp;或&nbsp;
        <Link size="sm" className="group cursor-pointer" href={space.UPLOAD}>
          导入浏览器书签
        </Link>
      </div>
    </div>
  )
}
