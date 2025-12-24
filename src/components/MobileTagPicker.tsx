import ReInput from '@/components/re-export/ReInput'
import { testTagNameOrPinyin } from '@/utils'
import { ScrollShadow, Switch, cn } from '@heroui/react'
import { useMount, useSetState, useUpdateEffect } from 'ahooks'
import { isEqual } from 'lodash'
import { CSSProperties, useLayoutEffect, useRef } from 'react'
import { TagPickerBox } from './common'
import TagPickerItem from './TagPickerItem'

interface Props {
  tags: SelectTag[]
  className?: string
  style?: CSSProperties
  onCloseMenu: () => void
}
export function MobileTagPicker(props: Props) {
  const { tags } = props

  const scrollDivRef = useRef<null | HTMLDivElement>(null)
  const [state, setState] = useSetState({
    filterTagInput: '',
    onlyMain: false,
    inputWrapperCls: '',
    showTags: tags,
  })

  useLayoutEffect(() => {
    let showTags = []
    if (state.filterTagInput) {
      // 输入了关键词，从所有标签中过滤
      showTags = tags.filter((tag) => testTagNameOrPinyin(state.filterTagInput, tag))
    } else {
      showTags = state.onlyMain ? tags.filter((tag) => tag.isMain) : tags
    }
    if (!isEqual(showTags, state.showTags)) {
      setState({ showTags })
    }
    // 每次进入不同的 /tag/$slug，元素滚动位置都会丢失，这里手动恢复
    const lastPosition = TagPickerBox.getScrollTop()
    if (lastPosition > 0) {
      scrollDivRef.current?.scrollTo({ top: lastPosition })
    }
  }, [state.filterTagInput, state.onlyMain, tags, state.showTags, setState])

  useMount(() => {
    setState({ onlyMain: TagPickerBox.getOnlyMain() })
  })

  useUpdateEffect(() => {
    TagPickerBox.setOnlyMain(state.onlyMain)
  }, [state.onlyMain])

  return (
    <div role="mobile-tag-picker" className="flex h-full flex-col" style={props.style}>
      <div className="flex-items-center my-4 shrink-0 gap-1 pr-4">
        <ReInput
          size="sm"
          classNames={{ inputWrapper: 'dark:bg-default-100/50' }}
          placeholder="过滤标签"
          isClearable
          value={state.filterTagInput}
          onValueChange={(v) => setState({ filterTagInput: v })}
        />
      </div>
      <div className="grow-0 overflow-auto">
        <ScrollShadow
          className="scrollbar-hide flex h-full flex-col gap-2"
          ref={scrollDivRef}
          role={TagPickerBox.SCROLLER_ROLE}
        >
          {state.showTags.map((tag) => (
            <TagPickerItem key={tag.id} tag={tag} tags={tags} onClick={props.onCloseMenu} />
          ))}
        </ScrollShadow>
      </div>
      {!state.filterTagInput && (
        <div className="flex-items-center h-16 shrink-0 gap-4">
          <Switch
            key={Number(state.onlyMain)}
            isSelected={state.onlyMain}
            onValueChange={(v) => setState({ onlyMain: v })}
          />
          <span className={cn(state.onlyMain ? 'text-foreground-600' : 'text-foreground-400')}>
            仅展示主标签
          </span>
        </div>
      )}
    </div>
  )
}
