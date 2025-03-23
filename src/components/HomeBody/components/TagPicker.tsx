import ClientIcon from '@/components/ClientIcon'
import { TagPickerBox } from '@/components/common'
import ReInput from '@/components/re-export/ReInput'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { testTagNameOrPinyin } from '@/utils'
import { IconNames } from '@cfg'
import { Kbd, ScrollShadow, Switch, cn } from '@heroui/react'
import { useMount, useSetState, useUpdateEffect } from 'ahooks'
import { isEqual } from 'lodash'
import { CSSProperties, useLayoutEffect, useRef } from 'react'
import { useHomePageContext } from '../ctx'

interface Props {
  className?: string
  style?: CSSProperties
}
export default function TagPicker(props: Props) {
  const { tags } = useHomePageContext()
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
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
    // 每次进入不同的 /tags/$slug，元素滚动位置都会丢失，这里手动恢复
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
    <div className="flex h-full flex-col" style={props.style}>
      <div className="my-4 shrink-0 gap-1 pr-4 flex-items-center">
        <ReInput
          size="sm"
          classNames={{ inputWrapper: 'dark:bg-opacity-50' }}
          placeholder="过滤标签"
          isClearable
          value={state.filterTagInput}
          onValueChange={(v) => setState({ filterTagInput: v })}
        />
      </div>

      <div className="grow-0 overflow-auto">
        <ScrollShadow
          className="flex h-full flex-col gap-2 scrollbar-hide"
          ref={scrollDivRef}
          role={TagPickerBox.SCROLLER_ROLE}
        >
          {state.showTags.map((tag) => {
            // 交互优化：/tag/:slug 仅 slug 变化时，减少重渲染
            const isSelected = selectedTags.map((t) => t.id).includes(tag.id)
            return (
              <div
                key={tag.id}
                className={cn(
                  'mr-4 inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-base',
                  'xs:hover:bg-zinc-600/10 xs:dark:hover:bg-zinc-800/80',
                  isSelected && 'bg-zinc-600/10 dark:bg-zinc-800/80 max-xs:!bg-blue-800/10'
                )}
                onClick={(e) => onClickTag({ event: e, tag })}
              >
                <ClientIcon color={tag.color || undefined} icon={tag.icon || IconNames.TAG} />
                <span className="grow text-foreground-600">{tag.name}</span>
              </div>
            )
          })}
        </ScrollShadow>
      </div>

      {!state.filterTagInput && (
        <div className="my-4 shrink-0 flex-items-center">
          <Switch
            size="sm"
            className="scale-[0.75]"
            key={Number(state.onlyMain)}
            isSelected={state.onlyMain}
            onValueChange={(v) => setState({ onlyMain: v })}
          />
          <span
            className={cn(
              'text-sm',
              state.onlyMain ? 'text-foreground-600' : 'text-foreground-400'
            )}
          >
            仅展示主标签
          </span>
        </div>
      )}
      <div className="pb-4 text-xs text-foreground-300">
        点击标签时，按住 <Kbd className="scale-80 opacity-80" keys={['alt']} />{' '}
        可多选，实现交叉筛选书签
      </div>
    </div>
  )
}
