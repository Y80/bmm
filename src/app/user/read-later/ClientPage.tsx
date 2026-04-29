'use client'

import {
  actCreateReadLaterItem,
  actDeleteReadLaterItem,
  actMarkReadLaterItemRead,
  actUpdateReadLaterItem,
} from '@/actions'
import {
  BookmarkIconDropdown,
  ClientIcon,
  Favicon,
  ReButton,
  ReInput,
  ReTextarea,
} from '@/components'
import type { SelectUserReadLaterItem } from '@/controllers'
import { runAction } from '@/utils/client'
import { IconNames } from '@cfg'
import {
  addToast,
  Button,
  Card,
  CardBody,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type ReadLaterItem = SelectUserReadLaterItem
type Status = ReadLaterItem['status']

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface ClientPageProps {
  initialUnreadItems: ReadLaterItem[]
  initialReadItems: ReadLaterItem[]
}

const STATUS_TIPS: Record<Status, string> = {
  unread: '抽一点安静时间，把这些文章读完、吸收，再沉淀成自己的东西。',
  read: '这些是你已经读过的内容，回看一下，也许会有新的连接和灵感。',
}

function formatFromNow(date: Date | string | null) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

function getArticleHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getFaviconUrl(host: string) {
  return `https://api.lcll.cc/favicon?host=${encodeURIComponent(host)}`
}

export default function ClientPage(props: ClientPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeStatus, setActiveStatus] = useState<Status>('unread')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [state, setState] = useSetState({
    unreadItems: props.initialUnreadItems,
    readItems: props.initialReadItems,
  })

  const items = activeStatus === 'unread' ? state.unreadItems : state.readItems
  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return items
    return items.filter((item) => {
      const host = getArticleHost(item.url)
      return [item.title, item.summary, host].some((text) => text.toLowerCase().includes(keyword))
    })
  }, [items, searchKeyword])
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
        onOk: (data) => {
          const okMsg =
            data.mode === 'ai'
              ? '已加入稍后阅读，并生成文章摘要'
              : data.mode === 'html'
                ? '已加入稍后阅读，已从网页提取标题和摘要'
                : '已加入稍后阅读，暂未获取到网页内容'
          addToast({
            color: 'success',
            title: '操作成功',
            description: okMsg,
          })
        },
      })
      if (!res.ok) return
      setState((prev) => ({
        unreadItems: [res.data.item, ...prev.unreadItems],
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

  function handleUpdate(item: ReadLaterItem) {
    setState((prev) => ({
      unreadItems: prev.unreadItems.map((el) => (el.id === item.id ? item : el)),
      readItems: prev.readItems.map((el) => (el.id === item.id ? item : el)),
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        shadow="none"
        className="border-divider/60 dark:bg-content1/62 overflow-hidden border bg-white/58 backdrop-blur-xl"
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
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">稍后阅读</h1>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-divider/60 dark:bg-content1/62 flex w-fit rounded-2xl border bg-white/58 p-1 backdrop-blur-xl">
          {[
            { key: 'unread' as const, label: '未读', count: stats.unread },
            { key: 'read' as const, label: '已读', count: stats.read },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveStatus(item.key)}
              className={cn(
                'flex h-9 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm transition-colors',
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

        <label className="border-divider/60 dark:bg-content1/62 flex h-11 w-full items-center gap-2 rounded-2xl border bg-white/58 px-3 text-sm backdrop-blur-xl transition focus-within:border-sky-500/40 focus-within:ring-2 focus-within:ring-sky-500/14 sm:max-w-80">
          <span className={cn(IconNames.Tabler.SEARCH, 'text-default-400 shrink-0 text-lg')} />
          <input
            type="search"
            aria-label="搜索稍后阅读"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="搜索标题、摘要或域名"
            className="placeholder:text-default-400 h-full min-w-0 flex-1 bg-transparent outline-hidden"
          />
        </label>
      </div>

      <p className="text-default-500 text-sm leading-6">{STATUS_TIPS[activeStatus]}</p>

      {filteredItems.length ? (
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <ReadLaterCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item)}
              onMarkRead={item.status === 'unread' ? () => handleMarkRead(item) : undefined}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      ) : (
        <Card
          shadow="none"
          className="border-divider/60 dark:bg-content1/54 border bg-white/50 backdrop-blur-xl"
        >
          <CardBody className="flex min-h-52 items-center justify-center text-center">
            <div>
              <ClientIcon
                icon={activeStatus === 'unread' ? IconNames.Tabler.READING : IconNames.Tabler.CHECK}
                className="text-default-300 mx-auto text-5xl"
              />
              <p className="text-default-500 mt-4 text-sm">
                {items.length
                  ? '没有匹配的文章'
                  : activeStatus === 'unread'
                    ? '暂无未读内容'
                    : '暂无已读内容'}
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
  onUpdate: (item: ReadLaterItem) => void
}) {
  const { item } = props
  const host = getArticleHost(item.url)
  return (
    <Card
      shadow="none"
      className="group/read-later-card border border-white/58 bg-white/38 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition hover:border-white/72 hover:bg-white/48 hover:shadow-[0_22px_58px_-38px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/[0.055] dark:shadow-[0_18px_50px_-36px_rgba(0,0,0,0.6)] dark:hover:border-white/16 dark:hover:bg-white/[0.075]"
    >
      <CardBody className="p-4 sm:p-5">
        <div className="flex min-w-0 gap-3.5">
          <ReadLaterFavicon key={`${host}-${item.icon || ''}`} host={host} icon={item.icon} />
          <div className="relative min-w-0 flex-1">
            <div className="text-default-400 absolute top-0 right-0 max-w-[42%] truncate text-right text-xs leading-5">
              {host}
            </div>
            <div className="pr-[44%]">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground line-clamp-2 inline text-base leading-6 font-semibold no-underline hover:text-slate-700 dark:hover:text-white"
              >
                {item.title}
              </a>
            </div>
            <p className="text-default-500 mt-2 line-clamp-3 text-sm leading-6 md:max-w-[72ch] dark:text-white/56">
              {item.summary}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ReadLaterMetaPill tone="time">
                {`${item.estimatedReadingMinutes} 分钟阅读`}
              </ReadLaterMetaPill>
              <ReadLaterMetaPill tone="date">{`${formatFromNow(item.createdAt)}加入`}</ReadLaterMetaPill>

              <div className="ml-auto flex items-center gap-1">
                <ReButton
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  size="md"
                  variant="light"
                  isIconOnly
                  tooltip="打开链接"
                  aria-label="打开链接"
                  className="text-default-500 size-9 min-w-9 border border-transparent bg-white/40 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-700 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.08] dark:hover:text-white"
                >
                  <span className={cn(IconNames.Tabler.EXTERNAL_LINK, 'text-lg')} />
                </ReButton>
                <ReadLaterEditButton item={item} onSaved={props.onUpdate} />
                {props.onMarkRead ? (
                  <ReButton
                    size="md"
                    variant="light"
                    isIconOnly
                    tooltip="标记已读"
                    aria-label="标记已读"
                    onClick={props.onMarkRead}
                    className="text-default-500 size-9 min-w-9 border border-transparent bg-white/40 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-700 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    <span className={cn(IconNames.Tabler.CHECK, 'text-lg')} />
                  </ReButton>
                ) : null}
                <ReButton
                  size="md"
                  variant="light"
                  isIconOnly
                  tooltip="删除"
                  aria-label="删除"
                  onClick={props.onDelete}
                  className="text-default-500 size-9 min-w-9 border border-transparent bg-white/40 hover:border-red-200/80 hover:bg-red-50/80 hover:text-red-600 dark:bg-white/[0.03] dark:hover:border-red-400/20 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <span className={cn(IconNames.Tabler.TRASH, 'text-lg')} />
                </ReButton>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function ReadLaterMetaPill(props: { children: string | number; tone: 'host' | 'time' | 'date' }) {
  const toneClassNames = {
    host: {
      pill: 'bg-sky-50/58 text-slate-600 dark:bg-sky-400/[0.07] dark:text-white/54',
      dot: 'bg-sky-400/70 dark:bg-sky-300/60',
    },
    time: {
      pill: 'bg-amber-50/62 text-slate-600 dark:bg-amber-300/[0.07] dark:text-white/54',
      dot: 'bg-amber-400/75 dark:bg-amber-300/62',
    },
    date: {
      pill: 'bg-emerald-50/58 text-slate-600 dark:bg-emerald-300/[0.07] dark:text-white/54',
      dot: 'bg-emerald-400/70 dark:bg-emerald-300/58',
    },
  }[props.tone]

  return (
    <span
      className={cn(
        'border-divider/50 flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-xs leading-none dark:border-white/8',
        toneClassNames.pill
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', toneClassNames.dot)} />
      {props.children}
    </span>
  )
}

function ReadLaterFavicon(props: { host: string; icon?: string | null }) {
  const autoFaviconUrl = getFaviconUrl(props.host)
  const [currentSrc, setCurrentSrc] = useState(props.icon || autoFaviconUrl)
  const [loadFailed, setLoadFailed] = useState(false)

  return (
    <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
      <span
        className={cn(IconNames.Tabler.READING, 'absolute text-xl text-slate-700')}
        aria-hidden
      />
      {!loadFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${props.host} favicon`}
          src={currentSrc}
          loading="lazy"
          className="relative size-full rounded-md bg-white object-contain"
          onError={() => {
            if (currentSrc !== autoFaviconUrl) {
              setCurrentSrc(autoFaviconUrl)
              return
            }
            setLoadFailed(true)
          }}
        />
      ) : null}
    </div>
  )
}

function ReadLaterEditButton(props: {
  item: ReadLaterItem
  onSaved: (item: ReadLaterItem) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    icon: props.item.icon || '',
    title: props.item.title,
    summary: props.item.summary,
  })

  useEffect(() => {
    if (!isOpen) return
    setForm({
      icon: props.item.icon || '',
      title: props.item.title,
      summary: props.item.summary,
    })
  }, [isOpen, props.item.icon, props.item.summary, props.item.title])

  async function handleSave() {
    if (isSaving) return
    setIsSaving(true)
    try {
      const res = await runAction(
        actUpdateReadLaterItem({
          id: props.item.id,
          icon: form.icon,
          title: form.title,
          summary: form.summary,
        }),
        { okMsg: '已更新稍后阅读内容' }
      )
      if (!res.ok) return
      props.onSaved(res.data)
      setIsOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <ReButton
        size="md"
        variant="light"
        isIconOnly
        tooltip="编辑"
        aria-label="编辑"
        onClick={() => setIsOpen(true)}
        className="text-default-500 size-9 min-w-9 border border-transparent bg-white/40 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-700 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.08] dark:hover:text-white"
      >
        <span className={cn(IconNames.Tabler.EDIT, 'text-lg')} />
      </ReButton>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} backdrop="blur">
        <ModalContent>
          <ModalHeader>编辑稍后阅读</ModalHeader>
          <ModalBody>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <ReadLaterFavicon
                  key={`${props.item.id}-${form.icon || props.item.icon || ''}`}
                  host={getArticleHost(props.item.url)}
                  icon={form.icon || props.item.icon}
                />
                <div className="min-w-0">
                  <div className="text-default-500 text-xs">当前链接</div>
                  <div className="text-default-700 truncate text-sm dark:text-white/70">
                    {props.item.url}
                  </div>
                </div>
              </div>
              <ReInput
                label="图标 URL"
                classNames={{ inputWrapper: 'pl-0' }}
                autoComplete="off"
                value={form.icon}
                onValueChange={(icon) => setForm((value) => ({ ...value, icon }))}
                startContent={
                  form.icon ? (
                    <Favicon className="ml-1.5" src={form.icon} showSpinner showErrorIconOnFailed />
                  ) : (
                    <span className="w-1.5" />
                  )
                }
                endContent={
                  <BookmarkIconDropdown
                    url={props.item.url}
                    onSelectIcon={(icon) => setForm((value) => ({ ...value, icon }))}
                  />
                }
              />
              <ReInput
                label="标题"
                autoComplete="off"
                value={form.title}
                onValueChange={(title) => setForm((value) => ({ ...value, title }))}
              />
              <ReTextarea
                label="摘要"
                minRows={4}
                value={form.summary}
                onValueChange={(summary) => setForm((value) => ({ ...value, summary }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsOpen(false)}>
              取消
            </Button>
            <ReButton color="primary" onClick={handleSave} isLoading={isSaving}>
              保存
            </ReButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
