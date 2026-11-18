'use client'

import ReInput from '@/components/re-export/ReInput'
import { usePageUtil } from '@/hooks'
import { IconNames, PageRoutes } from '@cfg'
import { cn, Kbd } from '@heroui/react'
import { useDebounceFn, useEventListener, useMount, useSetState } from 'ahooks'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface Props extends BaseComponentProps {
  compact?: boolean
}

export function SearchInput(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isUserSpace = usePageUtil().isUserSpace
  const routes = isUserSpace ? PageRoutes.User : PageRoutes.Public
  const fallbackHref = isUserSpace ? PageRoutes.User.SPACE : PageRoutes.Public.INDEX
  const urlKeyword = pathname === routes.SEARCH ? searchParams.get('keyword') || '' : ''
  const currentHref = urlKeyword ? routes.search(encodeURIComponent(urlKeyword)) : pathname
  const [state, setState] = useSetState({
    input: urlKeyword,
    focusInput: false,
  })
  const inputRef = useRef<HTMLDivElement>(null)
  const pendingHref = useRef<string | null>(null)

  function handleSearch(value: string) {
    const keyword = value.trim()
    const href = keyword ? routes.search(encodeURIComponent(keyword)) : fallbackHref
    if (href === pendingHref.current || (!pendingHref.current && keyword === urlKeyword)) return
    pendingHref.current = href
    router.push(href, { scroll: false })
  }

  const { run: scheduleSearch, cancel: cancelSearch } = useDebounceFn(handleSearch, { wait: 500 })

  useEffect(() => {
    const isOwnNavigation = pendingHref.current === currentHref
    pendingHref.current = null
    // Keep typing that happened while our own search navigation was pending.
    if (isOwnNavigation) return
    cancelSearch()
    setState({ input: urlKeyword })
  }, [currentHref, urlKeyword, cancelSearch, setState])

  function handleValueChange(value: string) {
    setState({ input: value })
    if (value.trim()) {
      scheduleSearch(value)
    } else {
      cancelSearch()
      handleSearch(value)
    }
  }

  function focusInput() {
    const input = inputRef.current?.querySelector('input')
    if (input?.getClientRects().length) input.focus()
  }

  useEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Enter' || event.isComposing) return
      cancelSearch()
      handleSearch(state.input)
    },
    { target: inputRef }
  )

  useEventListener('keydown', (event) => {
    if (event.key === '/') setTimeout(focusInput)
  })

  useMount(() => {
    if (pathname === routes.SEARCH) focusInput()
  })

  return (
    <ReInput
      value={state.input}
      placeholder={
        props.compact
          ? state.focusInput
            ? '搜索名称或标签'
            : '搜索'
          : state.focusInput
            ? '可根据网站名称、拼音、简介搜索'
            : '搜索网站'
      }
      fullWidth={false}
      classNames={{
        base: props.className,
        inputWrapper: cn(
          'border border-slate-200/80 bg-white/50 backdrop-blur-md data-[hover=true]:bg-white/60 data-[focus=true]:border-slate-300/95 data-[focus=true]:bg-white/68 dark:border-neutral-800 dark:bg-neutral-900 dark:backdrop-filter-none dark:data-[hover=true]:bg-neutral-800 dark:data-[focus=true]:border-neutral-500 dark:data-[focus=true]:bg-neutral-900 dark:shadow-none',
          'min-h-0 group-data-[focus-visible=true]:outline-none group-data-[focus-visible=true]:ring-1 group-data-[focus-visible=true]:ring-neutral-500 group-data-[focus-visible=true]:ring-offset-0',
          props.compact
            ? 'h-9 rounded-[18px] border-white/10 bg-white/6 px-2 data-[hover=true]:bg-white/9 data-[focus=true]:border-white/18 data-[focus=true]:bg-white/10'
            : 'h-10 rounded-2xl'
        ),
        input: cn('text-sm', props.compact && 'text-[13px] font-medium'),
      }}
      baseRef={inputRef}
      startContent={<span className={cn(IconNames.Tabler.SEARCH, 'text-default-400 text-lg')} />}
      endContent={
        !props.compact &&
        !state.focusInput &&
        !state.input && (
          <Kbd className="text-default-400 rounded-xl border border-slate-200/80 bg-slate-100/90 px-2.5 py-0 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            /
          </Kbd>
        )
      }
      isClearable={Boolean(state.input)}
      onValueChange={handleValueChange}
      onFocusChange={(v) => setState({ focusInput: v })}
    />
  )
}
