import { useGlobalContext } from '@/app/ctx'
import Favicon from '@/components/Favicon'
import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { Chip } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'
import { useMainPageContext } from '../ctx'

interface Props extends SelectPublicBookmark {
  editable?: boolean
  allTags?: SelectPublicTag[]
  onRemove?: () => void
  onEdit?: () => void
}

export default function BookmarkCard(props: Props) {
  const { tags } = useGlobalContext()

  const { onClickTag } = useMainPageContext()

  return (
    <div
      className={twMerge(
        'flex cursor-pointer flex-col gap-3 rounded-2xl p-4 transition',
        'max-xs:pb-3 max-xs:dark:border-0 max-xs:dark:bg-foreground-200/20',
        'border-2 border-foreground-200 dark:border-opacity-60',
        'hover:xs:border-blue-500 hover:xs:shadow-lg hover:xs:shadow-blue-500/50'
      )}
      onClick={() => window.open(props.url)}
    >
      <section className="gap-2 flex-items-center">
        <Favicon src={props.icon} showDefaultIcon />
        <div className="grow truncate">
          <h4 className="truncate text-foreground-700 xs:text-lg">{props.name}</h4>
        </div>
      </section>
      <span className="line-clamp-3 text-xs text-foreground-500">{props.description}</span>
      <section className="flex max-w-full grow items-end gap-2 overflow-auto scrollbar-hide">
        {props.relatedTagIds.map((id) => {
          const tag = tags.find((tag) => tag.id === id)
          if (!tag) return null
          return (
            <Chip
              key={tag.id}
              variant="flat"
              onClick={(event) => {
                event.stopPropagation()
                onClickTag({ tag, event })
              }}
              className="h-fit cursor-pointer border-none py-1 text-xs text-foreground-500 transition active:opacity-50 xs:hover:text-foreground-700"
            >
              {tag.name}
            </Chip>
          )
        })}
      </section>
    </div>
  )
}
