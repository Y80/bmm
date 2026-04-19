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
        'relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/85 bg-white/[0.34] shadow-[0_18px_42px_-34px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-white/8 dark:bg-white/[0.035] dark:shadow-none',
        props.className
      )}
      style={props.style}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_22%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_20%)]" />

      <div className="relative border-b border-slate-200/80 px-3 py-3.5 dark:border-white/8">
        <div className="px-1">
          <div className="text-sm font-semibold">标签池</div>
        </div>

        <div className="mt-2.5">
          <ReInput
            size="sm"
            placeholder="过滤标签"
            classNames={{
              inputWrapper:
                'h-8 border border-slate-200/80 bg-white/[0.5] px-2.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.12)] data-[hover=true]:bg-white/[0.62] data-[focus=true]:border-slate-300/95 dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none',
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
        <div className="relative border-t border-slate-200/80 px-4 py-3 dark:border-white/8">
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
