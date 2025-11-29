'use client'

import { actUpdatePublicTagSortOrders, actUpdateUserTagSortOrders } from '@/actions'
import MyModal from '@/components/MyModal'
import { usePageUtil } from '@/hooks'
import useIsDark from '@/hooks/useIsDark'
import { runAction } from '@/utils/client'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSetState } from 'ahooks'
import Color from 'color'
import { cloneElement, ReactElement, useMemo, useState } from 'react'

interface Props {
  tags: SelectTag[]
  refreshTags: () => void
  children: ReactElement
}

export default function SortTagModal(props: Props) {
  const [tags, setTags] = useState(props.tags)
  const [state, setState] = useSetState({ open: false })
  const pageUtil = usePageUtil()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active.id === over?.id) return
    const oldIndex = tags.findIndex((tag) => tag.id === active.id)
    const newIndex = tags.findIndex((tag) => tag.id === over?.id)
    setTags(arrayMove(tags, oldIndex, newIndex))
  }

  async function onOk() {
    const orders = [...tags]
      .reverse()
      .map((tag, idx) => {
        if (idx === tag.sortOrder) return null
        return { id: tag.id, order: idx }
      })
      .filter((el) => el) as { id: TagId; order: number }[]
    const action = pageUtil.isAdminSpace ? actUpdatePublicTagSortOrders : actUpdateUserTagSortOrders
    await runAction(action(orders), {
      okMsg: '标签排序已更新',
      onOk() {
        props.refreshTags()
        setState({ open: false })
      },
    })
  }

  return (
    <>
      {cloneElement(props.children, { onClick: () => setState({ open: true }) })}
      <MyModal
        isOpen={state.open}
        title="标签排序"
        size="xl"
        onClose={() => setState({ open: false })}
        onOk={onOk}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tags}>
            <div className="grid grid-cols-4 gap-3">
              {tags.map((tag) => (
                <SortableTag key={tag.id} tag={tag} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </MyModal>
    </>
  )
}

function SortableTag(props: { tag: SelectTag }) {
  const { tag } = props

  const isDark = useIsDark()

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.tag.id,
  })

  const bgColor = tag.color || (isDark ? '#fff' : '#333')

  const textColor = useMemo(() => {
    if (!tag.color) {
      return isDark ? '#333' : '#fff'
    }
    return Color(tag.color).isDark() ? '#fff' : '#333'
  }, [isDark, tag.color])

  const style = {
    backgroundColor: bgColor,
    color: textColor,
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className="cursor-grab gap-1 rounded border border-foreground-400 px-2 py-1 flex-items-center"
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <span className="">{tag.icon ? <Icon icon={tag.icon} /> : <span />}</span>
      <div className="grow select-none truncate text-center text-sm">{tag.name}</div>
    </div>
  )
}
