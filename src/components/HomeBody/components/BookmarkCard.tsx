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
        'flex cursor-pointer flex-col gap-3 rounded-2xl p-4 transition',
        'max-xs:pb-3 max-xs:dark:border-0 max-xs:dark:bg-foreground-200/20',
        'border-foreground-200 dark:border-opacity-60 border-2',
        'xs:hover:border-blue-500 xs:hover:shadow-lg xs:hover:shadow-blue-500/50'
      )}
      onClick={() => window.open(props.url, '_blank')}
    >
      <a
        className="flex-items-center gap-2"
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        title={generateLinkTitle()}
        onClick={(event) => event.stopPropagation()}
      >
        <Favicon src={props.icon} showDefaultIcon alt={`${props.name}网站图标`} />
        <div className="grow truncate">
          <h3 className="text-foreground-700 xs:text-lg truncate" aria-label={`访问${props.name}`}>
            {props.name}
          </h3>
        </div>
      </a>
      {(() => {
        const desc = props.description
        if (!desc) return <div />
        const node = (
          <p className="text-foreground-500 line-clamp-3 text-xs break-all" role="description">
            {desc}
          </p>
        )
        if (isMobile) return node
        return (
          <Tooltip delay={300} content={<span className="break-all">{desc}</span>} className="w-80">
            {node}
          </Tooltip>
        )
      })()}
      <div
        className="scrollbar-hide flex max-w-full grow items-end gap-2 overflow-auto"
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
              className="text-foreground-500 xs:hover:text-foreground-700 h-fit cursor-pointer border-none py-1 text-xs transition active:opacity-50"
            >
              {tag.name}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
