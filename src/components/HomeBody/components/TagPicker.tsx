import { TagPickerBox } from '@/components/common'
import ReInput from '@/components/re-export/ReInput'
import TagPickerItem from '@/components/TagPickerItem'
import { testTagNameOrPinyin } from '@/utils'
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
        'relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/65 bg-white/18 backdrop-blur-md dark:border-white/14 dark:bg-white/[0.06]',
        props.className
      )}
      style={props.style}
    >
      <div className="relative border-b border-slate-200/60 px-3 py-3.5 dark:border-white/12">
        <div className="px-1">
          <div className="text-sm font-semibold">标签池</div>
        </div>

        <div className="mt-2.5">
          <ReInput
            size="sm"
            placeholder="过滤标签"
            classNames={{
              inputWrapper:
                'h-8 border border-slate-200/65 bg-white/26 px-2.5 data-[hover=true]:bg-white/34 data-[focus=true]:border-slate-300/80 data-[focus=true]:bg-white/42 dark:border-white/12 dark:bg-white/[0.06] dark:data-[hover=true]:bg-white/[0.08] dark:data-[focus=true]:bg-white/[0.1]',
              input: 'text-sm',
              clearButton: 'text-default-400',
            }}
            isClearable
            value={state.filterTagInput}
            onValueChange={(v) => setState({ filterTagInput: v })}
          />
        </div>

        <div className="text-default-500 mt-2.5 px-1 text-[11px] leading-5">
          共 {tags.length} 个标签，可快速筛选当前书签
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
        <div className="relative border-t border-slate-200/60 px-4 py-3 dark:border-white/12">
          <div className="-ml-1 flex items-center gap-2">
            <Switch
              size="sm"
              className="scale-70"
              key={Number(state.onlyMain)}
              isSelected={state.onlyMain}
              onValueChange={(v) => setState({ onlyMain: v })}
            />
            <span
              className={cn(
                'text-[11px]',
                state.onlyMain ? 'text-foreground-700 dark:text-white' : 'text-default-500'
              )}
            >
              仅展示主标签
            </span>
          </div>
          <div className="text-default-400 mt-1 text-[11px] leading-4.5">
            点击标签时，按住 <Kbd className="scale-75 opacity-75" keys={['alt']} />{' '}
            可多选，实现交叉筛选书签。
          </div>
        </div>
      )}
    </div>
  )
}
