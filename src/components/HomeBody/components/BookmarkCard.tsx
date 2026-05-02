import Favicon from '@/components/Favicon'
import { useIsMobile } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { Chip, Tooltip, cn } from '@heroui/react'
import { useHomePageContext } from '../ctx'

interface Props extends SelectBookmark {
  editable?: boolean
  allTags?: SelectTag[]
  onRemove?: () => void
  onEdit?: () => void
}

function formatHostCheckedAt(checkedAt: Date | string | null | undefined) {
  if (!checkedAt) return '未知'
  return new Date(checkedAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getHostCheckDotClass(status: Props['hostCheckStatus']) {
  if (status === 'reachable') return 'bg-success-500'
  if (status === 'unreachable') return 'bg-danger-500'
  return 'bg-default-400'
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
      className="max-xs:pb-3 max-xs:dark:border-0 max-xs:dark:bg-foreground-200/20 xs:hover:-translate-y-0.5 xs:hover:border-slate-200/75 xs:hover:bg-white/[0.34] dark:xs:hover:border-white/10 dark:xs:hover:bg-white/[0.065] dark:xs:hover:shadow-none flex cursor-pointer flex-col gap-2 rounded-3xl border border-slate-200/85 bg-white/[0.24] p-4 backdrop-blur-md transition-all dark:border-white/8 dark:bg-white/[0.045]"
      onClick={() => window.open(props.url, '_blank')}
    >
      <a
        className="flex min-w-0 items-start gap-2"
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        title={generateLinkTitle()}
        onClick={(event) => event.stopPropagation()}
      >
        <Favicon src={props.icon} showDefaultIcon alt={`${props.name}网站图标`} />
        <div className="flex min-w-0 grow items-center gap-2">
          <h3
            className="text-foreground-700 xs:text-lg min-w-0 flex-1 truncate"
            aria-label={`访问${props.name}`}
          >
            {props.name}
          </h3>
          {props.hostCheckStatus === 'unreachable' ? (
            <Tooltip
              content={
                <span className="whitespace-pre-line">
                  {`书签可能无法访问：${props.hostCheckErrorMessage || '未知原因'}。\n检测时间：${formatHostCheckedAt(props.hostCheckedAt)}。`}
                </span>
              }
              className="max-w-72"
            >
              <span
                className={cn(
                  'inline-block size-2 shrink-0 rounded-full opacity-45 transition-opacity hover:opacity-80',
                  getHostCheckDotClass(props.hostCheckStatus)
                )}
              />
            </Tooltip>
          ) : (
            <span
              className={cn(
                'inline-block size-2 shrink-0 rounded-full opacity-35',
                getHostCheckDotClass(props.hostCheckStatus)
              )}
            />
          )}
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
              className="text-foreground-500 xs:hover:text-foreground-700 h-6 cursor-pointer border-none bg-slate-200/60 px-2 text-xs transition active:opacity-50 dark:bg-white/[0.06]"
            >
              {tag.name}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
