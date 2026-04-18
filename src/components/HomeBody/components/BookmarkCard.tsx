import Favicon from '@/components/Favicon'
import { useIsMobile } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { Chip, cn, Tooltip } from '@heroui/react'
import { useHomePageContext } from '../ctx'

interface Props extends SelectBookmark {
  editable?: boolean
  allTags?: SelectTag[]
  onRemove?: () => void
  onEdit?: () => void
}

export default function BookmarkCard(props: Props) {
  const { tags } = useHomePageContext()
  const { onClickTag } = useOnClickTag({ tags })
  const isMobile = useIsMobile()

  const generateLinkTitle = () => {
    const baseTitle = `${props.name} - ${props.description}`
    // 加入标签信息增强相关性
    const tagNames = props.relatedTagIds
      .map((id) => tags.find((tag) => tag.id === id)?.name)
      .filter(Boolean)
    return tagNames.length ? `${baseTitle} (标签: ${tagNames.join(', ')})` : baseTitle
  }

  return (
    <div
      className={cn(
        'group flex cursor-pointer flex-col gap-2.5 rounded-[24px] p-3.5 transition-[transform,border-color,background-color,box-shadow]',
        'max-xs:pb-3 max-xs:dark:border-0 max-xs:dark:bg-foreground-200/20',
        'border-divider/60 border bg-white/84 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.2)] dark:border-white/8 dark:bg-white/[0.045] dark:shadow-none',
        'xs:hover:-translate-y-0.5 xs:hover:border-sky-500/12 xs:hover:bg-white/90 xs:hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.18)] dark:xs:hover:border-white/10 dark:xs:hover:bg-white/[0.065] dark:xs:hover:shadow-none'
      )}
      onClick={() => window.open(props.url, '_blank')}
    >
      <a
        className="flex min-w-0 items-start gap-3"
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        title={generateLinkTitle()}
        onClick={(event) => event.stopPropagation()}
      >
        <Favicon src={props.icon} showDefaultIcon alt={`${props.name}网站图标`} />
        <div className="min-w-0 grow">
          <h3
            className="text-foreground-700 xs:text-lg truncate text-[1.12rem] font-semibold"
            aria-label={`访问${props.name}`}
          >
            {props.name}
          </h3>
        </div>
      </a>
      <div className="min-h-10">
        {(() => {
          const desc = props.description
          if (!desc) {
            return <p className="text-default-400 text-xs leading-5.5">打开站点查看详情与内容。</p>
          }
          const node = (
            <p
              className="text-foreground-500 line-clamp-3 text-xs leading-5.5 break-all"
              role="description"
            >
              {desc}
            </p>
          )
          if (isMobile) return node
          return (
            <p
              className="text-foreground-500 line-clamp-3 text-xs leading-5.5 break-all"
              role="description"
            >
              <Tooltip
                delay={500}
                content={
                  <span className="break-all">
                    {props.name}：{desc}
                  </span>
                }
                className="max-w-80"
              >
                <span>{desc}</span>
              </Tooltip>
            </p>
          )
        })()}
      </div>
      <div
        className="scrollbar-hide flex max-w-full grow items-end gap-1.5 overflow-auto pt-0.5"
        aria-label="相关标签"
      >
        {props.relatedTagIds.map((id) => {
          const tag = tags.find((tag) => tag.id === id)
          if (!tag) return null
          return (
            <Chip
              key={tag.id}
              variant="flat"
              as="a"
              {...getTagLinkAttrs(tag)}
              onClick={(event) => onClickTag({ tag, event: event as any })}
              className="text-foreground-500 xs:hover:text-foreground-700 h-fit cursor-pointer border-none bg-white/70 px-2 py-0.5 text-xs transition active:opacity-50 dark:bg-white/[0.06]"
            >
              {tag.name}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
