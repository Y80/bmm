import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { IconNames } from '@cfg'
import { cn } from '@heroui/react'
import { useMemo } from 'react'
import ClientIcon from './ClientIcon'

interface Props {
  tag: SelectTag
  tags: SelectTag[]
  onClick?: () => void
}

export default function TagPickerItem({ tag, tags, onClick }: Props) {
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
  const isSelected = useMemo(() => {
    return selectedTags.map((t) => t.id).includes(tag.id)
  }, [selectedTags, tag.id])

  return (
    <a
      {...getTagLinkAttrs(tag)}
      className={cn(
        'group relative flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 transition-[background-color,box-shadow,color,transform] duration-150',
        'text-default-700 hover:translate-x-0.5 hover:bg-slate-200/52 dark:text-white/82 dark:hover:bg-neutral-900',
        isSelected &&
          'bg-slate-200/64 text-slate-900 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.12)] hover:bg-slate-200/72 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
      )}
      onClick={(e) => {
        onClick?.()
        onClickTag({ event: e, tag })
      }}
    >
      <div
        className={cn(
          'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        )}
      />
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg">
        <ClientIcon
          color={tag.color || undefined}
          icon={tag.icon || IconNames.Tabler.TAG}
          className="text-lg"
        />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{tag.name}</span>
    </a>
  )
}
