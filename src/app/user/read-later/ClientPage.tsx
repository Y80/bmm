'use client'

import {
  actCreateReadLaterItem,
  actDeleteReadLaterItem,
  actMarkReadLaterItemRead,
} from '@/actions'
import { ClientIcon } from '@/components'
import type { SelectUserReadLaterItem } from '@/controllers'
import { runAction } from '@/utils/client'
import { IconNames } from '@cfg'
import { Button, Card, CardBody, CardHeader, cn } from '@heroui/react'
import { useSetState } from 'ahooks'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FormEvent, useMemo, useRef, useState } from 'react'

type ReadLaterItem = SelectUserReadLaterItem
type Status = ReadLaterItem['status']

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface ClientPageProps {
  initialUnreadItems: ReadLaterItem[]
  initialReadItems: ReadLaterItem[]
}

function formatDate(date: Date | string | null) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function formatFromNow(date: Date | string | null) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

export default function ClientPage(props: ClientPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeStatus, setActiveStatus] = useState<Status>('unread')
  const [state, setState] = useSetState({
    unreadItems: props.initialUnreadItems,
    readItems: props.initialReadItems,
  })

  const items = activeStatus === 'unread' ? state.unreadItems : state.readItems
  const stats = useMemo(
    () => ({
      unread: state.unreadItems.length,
      read: state.readItems.length,
    }),
    [state.readItems.length, state.unreadItems.length]
  )

  async function handleCreate() {
    if (isCreating) return
    setIsCreating(true)
    try {
      const nextUrl = inputRef.current?.value.trim()
      if (!nextUrl) return
      const res = await runAction(actCreateReadLaterItem({ url: nextUrl }), {
        okMsg: '已加入稍后阅读',
      })
      if (!res.ok) return
      setState((prev) => ({
        unreadItems: [res.data, ...prev.unreadItems],
      }))
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      setActiveStatus('unread')
    } finally {
      setIsCreating(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleCreate()
  }

  async function handleMarkRead(item: ReadLaterItem) {
    const res = await runAction(actMarkReadLaterItemRead({ id: item.id }), {
      okMsg: '已标记为已读',
    })
    if (!res.ok) return
    setState((prev) => ({
      unreadItems: prev.unreadItems.filter((el) => el.id !== item.id),
      readItems: [res.data, ...prev.readItems],
    }))
  }

  async function handleDelete(item: ReadLaterItem) {
    const res = await runAction(actDeleteReadLaterItem({ id: item.id }), {
      okMsg: '已删除',
    })
    if (!res.ok) return
    setState((prev) => ({
      unreadItems: prev.unreadItems.filter((el) => el.id !== item.id),
      readItems: prev.readItems.filter((el) => el.id !== item.id),
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        shadow="none"
        className="border-divider/60 overflow-hidden border bg-white/58 backdrop-blur-xl dark:bg-content1/62"
      >
        <CardBody className="relative p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_34%)]" />
          <div className="relative px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-default-500 flex items-center gap-2 text-xs font-medium tracking-[0.24em] uppercase">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Read Later
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  稍后阅读
                </h1>
                <p className="text-default-600 mt-2 text-sm leading-6">
                  输入文章 URL，自动提炼标题、摘要和预计阅读用时。
                </p>
              </div>

              <form className="flex w-full gap-2 lg:max-w-xl" onSubmit={handleSubmit}>
                <input
                  aria-label="稍后阅读 URL"
                  placeholder="https://example.com/article"
                  ref={inputRef}
                  className="border-divider/70 h-10 min-w-0 flex-1 rounded-xl border bg-white/70 px-3 text-sm outline-hidden transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 dark:bg-white/[0.06]"
                />
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreate}
                  aria-label={isCreating ? '正在添加' : undefined}
                  className={cn(
                    'bg-primary text-primary-foreground flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-80',
                    isCreating ? 'w-10 px-0' : 'px-5'
                  )}
                >
                  {isCreating ? (
                    <span className={cn(IconNames.Tabler.LOADER_2, 'animate-spin text-base')} />
                  ) : (
                    <>
                      <span className={IconNames.Tabler.PLUS} />
                      <span>添加</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="border-divider/60 flex w-fit rounded-2xl border bg-white/58 p-1 backdrop-blur-xl dark:bg-content1/62">
        {[
          { key: 'unread' as const, label: '未读', count: stats.unread },
          { key: 'read' as const, label: '已读', count: stats.read },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveStatus(item.key)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-xl px-4 text-sm transition-colors',
              activeStatus === item.key
                ? 'bg-slate-950 text-white hover:bg-slate-900 dark:bg-white dark:text-black dark:hover:bg-white/90'
                : 'text-foreground-600 hover:bg-slate-100/80 hover:text-slate-950 dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white'
            )}
          >
            {item.label}
            <span className="opacity-70">{item.count}</span>
          </button>
        ))}
      </div>

      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <ReadLaterCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item)}
              onMarkRead={item.status === 'unread' ? () => handleMarkRead(item) : undefined}
            />
          ))}
        </div>
      ) : (
        <Card
          shadow="none"
          className="border-divider/60 border bg-white/50 backdrop-blur-xl dark:bg-content1/54"
        >
          <CardBody className="flex min-h-52 items-center justify-center text-center">
            <div>
              <ClientIcon
                icon={activeStatus === 'unread' ? IconNames.Tabler.READING : IconNames.Tabler.CHECK}
                className="text-default-300 mx-auto text-5xl"
              />
              <p className="text-default-500 mt-4 text-sm">
                {activeStatus === 'unread' ? '暂无未读内容' : '暂无已读内容'}
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function ReadLaterCard(props: {
  item: ReadLaterItem
  onDelete: () => Promise<void>
  onMarkRead?: () => Promise<void>
}) {
  const { item } = props
  return (
    <Card
      shadow="none"
      className="border-divider/60 border bg-white/58 backdrop-blur-xl transition hover:border-sky-500/20 hover:bg-white/72 dark:bg-content1/62 dark:hover:border-white/12 dark:hover:bg-content1/72"
    >
      <CardHeader className="flex items-start gap-3 px-4 pb-1 pt-4 sm:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/15 dark:bg-white/10 dark:text-white">
          <span className={cn(IconNames.Tabler.READING, 'text-xl')} />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-foreground line-clamp-2 text-base font-semibold no-underline hover:text-sky-600 dark:hover:text-sky-300"
          >
            {item.title}
          </a>
          <div className="text-default-500 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span>{item.estimatedReadingMinutes} 分钟阅读</span>
            <span>
              {item.status === 'read'
                ? `已读于 ${formatDate(item.readAt)}`
                : `${formatFromNow(item.createdAt)}加入`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 pb-4 pt-2 sm:px-5">
        <p className="text-default-600 line-clamp-3 text-sm leading-6">{item.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            as="a"
            href={item.url}
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="bordered"
            className="border-divider/70 bg-white/50 dark:bg-white/[0.04]"
            startContent={<span className={IconNames.Tabler.EXTERNAL_LINK} />}
          >
            打开链接
          </Button>
          {props.onMarkRead ? (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={props.onMarkRead}
              startContent={<span className={IconNames.Tabler.CHECK} />}
            >
              标记已读
            </Button>
          ) : null}
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={props.onDelete}
            startContent={<span className={IconNames.Tabler.TRASH} />}
          >
            删除
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
