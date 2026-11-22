import { TagPickerBox } from '@/components/common'
import { HOME_CONTENT_LIGHT_BACKGROUND_CLS } from '@/components/HomeBody/styles'
import ReInput from '@/components/re-export/ReInput'
import ReTooltip from '@/components/re-export/ReTooltip'
import TagPickerItem from '@/components/TagPickerItem'
import { testTagNameOrPinyin } from '@/utils'
import { IconNames } from '@cfg'
import { Kbd, ScrollShadow, Switch, cn } from '@heroui/react'
import { useMount, useSetState, useUpdateEffect } from 'ahooks'
import { isEqual } from 'lodash'
import { CSSProperties, useId, useLayoutEffect, useRef } from 'react'
import { useHomePageContext } from '../ctx'

interface Props {
  className?: string
  style?: CSSProperties
}
export default function TagPicker(props: Props) {
  const { tags } = useHomePageContext()
  const onlyMainLabelId = useId()
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
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/65 backdrop-blur-md dark:border-neutral-800 dark:bg-[#111111] dark:backdrop-filter-none',
        HOME_CONTENT_LIGHT_BACKGROUND_CLS,
        props.className
      )}
      style={props.style}
    >
      <div className="relative border-b border-slate-200/60 px-3 py-3.5 dark:border-neutral-800">
        <div className="px-1">
          <div className="text-sm font-semibold">标签池</div>
        </div>

        <div className="mt-2.5">
          <ReInput
            size="sm"
            placeholder="过滤标签"
            classNames={{
              inputWrapper:
                'h-8 border border-slate-200/65 bg-white/26 px-2.5 data-[hover=true]:bg-white/34 data-[focus=true]:border-slate-300/80 data-[focus=true]:bg-white/42 dark:border-neutral-800 dark:bg-neutral-900 dark:data-[hover=true]:bg-neutral-800 dark:data-[focus=true]:border-neutral-500 dark:data-[focus=true]:bg-neutral-900',
              input: 'text-sm',
              clearButton: 'text-default-400',
            }}
            isClearable
            value={state.filterTagInput}
            onValueChange={(v) => setState({ filterTagInput: v })}
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-2.5 py-3">
        <ScrollShadow
          className="scrollbar-hide flex flex-col content-start gap-1 pr-1"
          ref={scrollDivRef}
          role={TagPickerBox.SCROLLER_ROLE}
        >
          {state.showTags.map((tag) => (
            <TagPickerItem key={tag.id} tag={tag} tags={tags} />
          ))}
        </ScrollShadow>
      </div>

      {!state.filterTagInput && (
        <div className="relative flex items-center justify-between gap-2 border-t border-slate-200/60 px-4 py-3 dark:border-neutral-800">
          <ReTooltip
            placement="top"
            classNames={{ content: 'max-w-60 px-3 py-2' }}
            content={
              <span className="text-xs leading-5">
                点击标签时，按住 <Kbd className="scale-75" keys={['alt']} />{' '}
                可多选，实现交叉筛选书签。
              </span>
            }
          >
            <span
              id={onlyMainLabelId}
              tabIndex={0}
              className={cn(
                'focus-visible:outline-focus inline-flex cursor-help items-center gap-1.5 rounded-sm text-xs focus-visible:outline-2 focus-visible:outline-offset-2',
                state.onlyMain ? 'text-foreground-700 dark:text-white' : 'text-default-600'
              )}
            >
              仅展示主标签
              <span
                aria-hidden="true"
                className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border border-current"
              >
                <span className={cn(IconNames.Tabler.QUESTION_MARK, 'size-2.5')} />
              </span>
            </span>
          </ReTooltip>
          <Switch
            aria-labelledby={onlyMainLabelId}
            size="sm"
            className="shrink-0 origin-right scale-70"
            classNames={{ wrapper: 'mr-0' }}
            key={Number(state.onlyMain)}
            isSelected={state.onlyMain}
            onValueChange={(v) => setState({ onlyMain: v })}
          />
        </div>
      )}
    </div>
  )
}
