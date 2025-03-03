import { Assets, PageRoutes } from '@cfg'
import { Image, Link } from '@heroui/react'

interface Props {
  target: 'bookmark' | 'tag'
}

export default function EmptyListPlaceholder(props: Props) {
  const isTag = props.target === 'tag'
  return (
    <div className="my-24 flex-col flex-center">
      <Image isBlurred src={Assets.BOX_EMPTY_PNG} width={120} height={120} alt="empty" />
      <div className="mt-12 text-sm">
        暂无内容，立即
        <Link
          size="sm"
          className="group cursor-pointer"
          href={isTag ? PageRoutes.Admin.tagSlug('new') : PageRoutes.Admin.bookmarkSlug('new')}
        >
          &nbsp;新建{isTag ? '标签' : '书签'}
        </Link>
        &nbsp;或&nbsp;
        <Link size="sm" className="group cursor-pointer" href={PageRoutes.Admin.UPLOAD}>
          导入浏览器书签
        </Link>
      </div>
    </div>
  )
}
