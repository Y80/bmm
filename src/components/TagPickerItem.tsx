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
        'group relative flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 transition-[background-color,border-color,box-shadow,color,transform] duration-150',
        'border border-transparent text-default-700 hover:translate-x-0.5 hover:border-slate-200/90 hover:bg-slate-100/78 dark:text-white/82 dark:hover:border-white/10 dark:hover:bg-white/[0.08]',
        isSelected &&
          'border-slate-300/90 bg-slate-100/88 text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/10 dark:text-white'
      )}
      onClick={(e) => {
        onClick?.()
        onClickTag({ event: e, tag })
      }}
    >
      <div
        className={cn(
          'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-400 via-cyan-400 to-emerald-400 transition-opacity duration-150',
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
