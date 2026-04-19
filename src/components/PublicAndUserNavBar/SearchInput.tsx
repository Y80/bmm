'use client'

import { ReInput } from '@/components'
import { usePageUtil } from '@/hooks'
import { IconNames, PageRoutes } from '@cfg'
import { cn, Kbd } from '@heroui/react'
import { useDebounceEffect, useEventListener, useMemoizedFn, useMount, useSetState } from 'ahooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

interface Props extends BaseComponentProps {
  compact?: boolean
}

export function SearchInput(props: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isUserSpace = usePageUtil().isUserSpace
  const routes = isUserSpace ? PageRoutes.User : PageRoutes.Public
  const fallbackHref = isUserSpace ? PageRoutes.User.SPACE : PageRoutes.Public.INDEX
  const [state, setState] = useSetState({
    input: searchParams.get('keyword') || '',
    focusInput: false,
  })
  const inputRef = useRef<null | HTMLDivElement>(null)

  const handleSearch = useMemoizedFn(() => {
    const keyword = state.input.trim()
    if (keyword === (searchParams.get('keyword') || '')) return
    router.push(keyword ? routes.search(keyword) : fallbackHref)
  })

  // 按下回车键，执行搜索
  useEventListener(
    'keydown',
    (e) => {
      e.key === 'Enter' && handleSearch()
    },
    { target: inputRef }
  )

  useEventListener('keydown', (e) => {
    if (e.key === '/') {
      setTimeout(() => {
        inputRef.current!.querySelector('input')?.focus()
      })
    }
  })

  useDebounceEffect(() => handleSearch(), [state.input], {
    wait: 500,
    leading: false,
    trailing: true,
  })

  useMount(() => {
    if (
      [PageRoutes.Public.SEARCH, PageRoutes.User.SEARCH].includes(location.pathname as any) &&
      inputRef.current
    ) {
      inputRef.current.querySelector('input')?.focus()
    }
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
          'border border-slate-200/80 bg-white/[0.5] shadow-[0_14px_28px_-22px_rgba(15,23,42,0.12)] backdrop-blur-md data-[hover=true]:bg-white/[0.6] data-[focus=true]:border-slate-300/95 data-[focus=true]:bg-white/[0.68] data-[focus=true]:shadow-[0_16px_32px_-24px_rgba(15,23,42,0.14)] dark:border-white/8 dark:bg-white/[0.04] dark:data-[hover=true]:bg-white/[0.06] dark:data-[focus=true]:bg-white/[0.07] dark:shadow-none',
          props.compact ? 'h-12 rounded-[22px] px-1' : 'h-11 rounded-2xl'
        ),
        input: cn('text-sm', props.compact && 'text-[15px]'),
      }}
      baseRef={inputRef}
      startContent={<span className={cn(IconNames.Tabler.SEARCH, 'text-default-400 text-lg')} />}
      endContent={
        !props.compact &&
        !state.focusInput &&
        !state.input && (
          <Kbd className="text-default-400 rounded-xl border border-slate-200/80 bg-slate-100/90 px-2.5 py-0 dark:border-white/8 dark:bg-white/[0.06]">
            /
          </Kbd>
        )
      }
      onClear={state.input ? () => router.push(fallbackHref) : undefined}
      onValueChange={(v) => setState({ input: v })}
      onFocusChange={(v) => setState({ focusInput: v })}
    />
  )
}
