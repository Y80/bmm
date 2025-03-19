'use client'

import { ReInput } from '@/components'
import { usePageUtil } from '@/hooks'
import { IconNames, PageRoutes } from '@cfg'
import { cn, Kbd } from '@heroui/react'
import { useDebounceEffect, useEventListener, useMemoizedFn, useMount, useSetState } from 'ahooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export default function SearchInput(props: BaseComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const routes = usePageUtil().isUserSpace ? PageRoutes.User : PageRoutes.Public
  const [state, setState] = useSetState({
    input: searchParams.get('keyword') || '',
    focusInput: false,
  })
  const inputRef = useRef<null | HTMLDivElement>(null)

  const handleSearch = useMemoizedFn(() => {
    const keyword = state.input.trim()
    if (keyword === (searchParams.get('keyword') || '')) return
    router.push(keyword ? routes.search(keyword) : routes.INDEX)
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
    if (location.pathname === PageRoutes.Public.SEARCH && inputRef.current) {
      inputRef.current.querySelector('input')?.focus()
    }
  })

  return (
    <ReInput
      value={state.input}
      placeholder={state.focusInput ? '可根据网站名称、拼音、简介搜索' : '网站搜索'}
      fullWidth={false}
      classNames={{
        base: props.className,
        inputWrapper: 'dark:bg-opacity-50',
      }}
      baseRef={inputRef}
      startContent={<span className={cn(IconNames.SEARCH, 'text-xl')} />}
      endContent={
        !state.focusInput && !state.input && <Kbd className="px-3 dark:opacity-80">/</Kbd>
      }
      onClear={state.input ? () => router.push(routes.INDEX) : undefined}
      onValueChange={(v) => setState({ input: v })}
      onFocusChange={(v) => setState({ focusInput: v })}
    />
  )
}
