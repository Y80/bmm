import { Assets, IconNames } from '@cfg'
import { cn, Image, Link } from '@nextui-org/react'

interface Props {
  href: string
}

export default function EmptyListPlaceholder(props: Props) {
  return (
    <div className="my-24 flex-col flex-center">
      <Image isBlurred src={Assets.BOX_EMPTY_PNG} width={120} height={120} alt="empty" />
      <div className="mt-12 text-sm">
        暂无内容，
        <Link size="sm" className="group cursor-pointer" href={props.href}>
          立即创建
          <span
            className={cn(IconNames.ARROW_RIGHT, 'ml-1 transition group-hover:translate-x-1')}
          />
        </Link>
      </div>
    </div>
  )
}
