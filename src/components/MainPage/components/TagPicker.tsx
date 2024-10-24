import { useGlobalContext } from '@/app/ctx'
import ClientIcon from '@/components/ClientIcon'
import ReInput from '@/components/re-export/ReInput'
import { testTagNameOrPinyin } from '@/utils'
import { IconNames } from '@cfg'
import { ScrollShadow, Switch } from '@nextui-org/react'
import { useMount, useSetState, useUpdateEffect } from 'ahooks'
import clsx from 'clsx'
import { isEqual } from 'lodash'
import { CSSProperties, useLayoutEffect, useRef } from 'react'
import { useMainPageContext } from '../ctx'

const SCROLL_DIV_ROLE = 'tag-picker-scroll-div'

const ONLY_MAIN_KEY = 'only-main-tags'

export const TAG_PICKER_SCROLL_TOP_KEY = 'tag picker last scrollTop'

export function getScrollElement() {
  return document.querySelector(`div[role="${SCROLL_DIV_ROLE}"]`)
}

export default function TagPicker(props: { className?: string; style?: CSSProperties }) {
  const { tags } = useGlobalContext()

  const scrollDivRef = useRef<null | HTMLDivElement>(null)

  const { selectedTags, onClickTag } = useMainPageContext()

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
    setTimeout(() => {
      const lastPosition = parseInt(localStorage.getItem(TAG_PICKER_SCROLL_TOP_KEY) || '')
      if (lastPosition > 0) {
        scrollDivRef.current?.scrollTo({ top: lastPosition })
      }
    })
  }, [state.filterTagInput, state.onlyMain, tags, state.showTags, setState])

  useMount(() => {
    setState({ onlyMain: localStorage.getItem(ONLY_MAIN_KEY) === 'true' })
  })

  useUpdateEffect(() => {
    localStorage.setItem(ONLY_MAIN_KEY, String(state.onlyMain))
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
          className="flex h-full flex-col gap-2"
          ref={scrollDivRef}
          role={SCROLL_DIV_ROLE}
        >
          {state.showTags.map((tag) => {
            // 交互优化：/tag/:slug 仅 slug 变化时，减少重渲染
            const isSelected = selectedTags.map((t) => t.id).includes(tag.id)
            return (
              <div
                key={tag.id}
                className={clsx(
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
        <div className="h-16 shrink-0 flex-items-center">
          <Switch
            size="sm"
            className="scale-[0.75]"
            key={Number(state.onlyMain)}
            isSelected={state.onlyMain}
            onValueChange={(v) => setState({ onlyMain: v })}
          />
          <span
            className={clsx(
              'text-sm',
              state.onlyMain ? 'text-foreground-600' : 'text-foreground-400'
            )}
          >
            仅展示主标签
          </span>
        </div>
      )}
    </div>
  )
}
