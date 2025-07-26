import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { IconNames } from '@cfg'
import { cn } from '@heroui/react'
import { useMemo } from 'react'
import ClientIcon from './ClientIcon'

interface Props {
  tag: SelectTag
  tags: SelectTag[]
}

export default function TagPickerItem({ tag, tags }: Props) {
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
  const isSelected = useMemo(() => {
    return selectedTags.map((t) => t.id).includes(tag.id)
  }, [selectedTags, tag.id])

  return (
    <a
      {...getTagLinkAttrs(tag)}
      className={cn(
        'mr-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-base',
        'xs:hover:bg-zinc-600/10 xs:dark:hover:bg-zinc-800/80',
        isSelected && 'bg-zinc-600/10 dark:bg-zinc-800/80 max-xs:!bg-blue-800/10'
      )}
      onClick={(e) => onClickTag({ event: e, tag })}
    >
      <ClientIcon color={tag.color || undefined} icon={tag.icon || IconNames.TAG} />
      <span className="grow text-foreground-600">{tag.name}</span>
    </a>
  )
}
