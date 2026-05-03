'use client'

import {
  actCheckPublicBookmarkHost,
  actCheckUserBookmarkHost,
  actDeletePublicBookmark,
  actDeleteUserBookmark,
  actFindPublicBookmarks,
  actFindUserBookmarks,
  actGetPublicBookmarkHostCheckTask,
  actGetUserBookmarkHostCheckTask,
  actStartPublicBookmarkHostCheckTask,
  actStartUserBookmarkHostCheckTask,
  actUpdatePublicBookmark,
  actUpdateUserBookmark,
} from '@/actions'
import ClientIcon from '@/components/ClientIcon'
import EmptyListPlaceholder from '@/components/EmptyListPlaceholder'
import Favicon from '@/components/Favicon'
import ListPageLayout from '@/components/ListPageLayout'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { PaginationControls } from '@/components/ui'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import type { CheckHostsTaskValue } from '@/controllers'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils/client'
import { IconNames, PageRoutes } from '@cfg'
import {
  Button,
  Chip,
  addToast,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@heroui/react'
import { useDebounceFn, useRequest, useSetState, useUpdateEffect } from 'ahooks'
import { Progress } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import z from 'zod'

const SORTERS = [
  { name: '创建时间降序', key: '-createTime', iconCls: IconNames.Tabler.SORT_DESC },
  { name: '创建时间升序', key: '+createTime', iconCls: IconNames.Tabler.SORT_ASC },
  { name: '更新时间降序', key: '-updateTime', iconCls: IconNames.Tabler.SORT_DESC },
  { name: '更新时间升序', key: '+updateTime', iconCls: IconNames.Tabler.SORT_ASC },
] as const

const HOST_CHECK_STATUSES = [
  { name: '全部状态', key: 'all' },
  { name: '未检测', key: 'unchecked' },
  { name: '可访问', key: 'reachable' },
  { name: '不可访问', key: 'unreachable' },
] as const

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_CACHE_PREFIX = 'bmm:page-size:'

function getSelectionKey(selection: unknown) {
  if (selection instanceof Set) {
    const [key] = Array.from(selection)
    return key ? String(key) : ''
  }
  if (selection && typeof selection === 'object' && 'currentKey' in selection) {
    return String((selection as { currentKey?: string }).currentKey || '')
  }
  return ''
}

function getPageSizeCacheKey(pathname: string) {
  return `${PAGE_SIZE_CACHE_PREFIX}${pathname}`
}

function getCachedPageSize(pathname: string) {
  if (typeof window === 'undefined') return DEFAULT_PAGE_SIZE
  const pageSize = Number(window.localStorage.getItem(getPageSizeCacheKey(pathname)))
  return PAGE_SIZE_OPTIONS.includes(pageSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? pageSize
    : DEFAULT_PAGE_SIZE
}

export type BookmarkListPageProps = {
  tags: SelectTag[]
  totalBookmarks: number
}

export default function BookmarkListPage(props: BookmarkListPageProps) {
  const isUserSpace = usePageUtil().isUserSpace
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [state, setState] = useSetState({
    loading: true,
    sorterKey: (searchParams.get('sorterKey') || SORTERS[0].key) as (typeof SORTERS)[number]['key'],
    keyword: searchParams.get('keyword') || '',
    selectedTag: searchParams.get('tag'),
    hostCheckStatus: (searchParams.get('hostCheckStatus') || 'all') as (typeof HOST_CHECK_STATUSES)[number]['key'],
    checkingId: null as BookmarkId | null,
    checkHostsTask: null as CheckHostsTaskValue | null,
    startingCheckHostsTask: false,
    pageSize: Number(searchParams.get('pageSize')) || getCachedPageSize(pathname),
    pager: {
      page: Number(searchParams.get('page')) || 1,
      // 页码总数
      total: 1,
    },
  })
  const dataRef = useRef({ loadingMutable: true })
  const taskRunningRef = useRef(false)

  const {
    refresh,
    data: bookmarks = [],
    mutate,
  } = useRequest(
    async () => {
      const input: z.input<typeof findManyBookmarksSchema> = {
        limit: state.pageSize,
        page: state.pager.page,
        keyword: state.keyword,
        sorterKey: state.sorterKey,
        hostCheckStatus: state.hostCheckStatus,
        includeHostCheckSummary: true,
        ...(state.selectedTag && { tagIds: state.selectedTag }),
      }
      dataRef.current.loadingMutable && setState({ loading: true })
      const action = isUserSpace ? actFindUserBookmarks : actFindPublicBookmarks
      const res = await runAction(action(findManyBookmarksSchema.parse(input)))
      setState({ loading: false })
      dataRef.current.loadingMutable = true
      if (!res.ok) return []
      setState((state) => ({
        pager: {
          ...state.pager,
          total:
            res.data.total <= state.pageSize ? 1 : Math.ceil(res.data.total / state.pageSize),
        },
      }))
      return res.data.list
    },
    {
      ready: isUserSpace !== null,
      refreshDeps: [
        state.keyword,
        state.sorterKey,
        state.hostCheckStatus,
        state.pageSize,
        state.pager.page,
        state.selectedTag,
        isUserSpace,
      ],
    }
  )

  const { run: refreshCheckHostsTask } = useRequest(
    async () => {
      const action = isUserSpace
        ? actGetUserBookmarkHostCheckTask
        : actGetPublicBookmarkHostCheckTask
      const res = await runAction(action(), { errToast: { hidden: true } })
      if (!res.ok) return null

      if (taskRunningRef.current && res.data?.finishedAt) {
        refresh()
      }
      taskRunningRef.current = res.data?.finishedAt === null
      setState({ checkHostsTask: res.data || null })
      return res.data || null
    },
    {
      ready: isUserSpace !== null,
      refreshDeps: [isUserSpace],
    }
  )

  const isCheckingHosts = state.checkHostsTask?.finishedAt === null
  const checkHostsPercent =
    state.checkHostsTask && state.checkHostsTask.total > 0
      ? Math.round((state.checkHostsTask.checked / state.checkHostsTask.total) * 100)
      : 0

  useEffect(() => {
    if (!isCheckingHosts) return
    const timer = window.setInterval(() => refreshCheckHostsTask(), 5000)
    return () => window.clearInterval(timer)
  }, [isCheckingHosts, refreshCheckHostsTask])

  // 将状态同步到 URL 查询参数中
  useUpdateEffect(() => {
    const payload: Record<string, string> = {
      page: state.pager.page.toString(),
      sorterKey: state.sorterKey,
    }
    state.selectedTag && (payload.tag = state.selectedTag)
    state.keyword && (payload.keyword = state.keyword)
    state.hostCheckStatus !== 'all' && (payload.hostCheckStatus = state.hostCheckStatus)
    state.pageSize !== DEFAULT_PAGE_SIZE && (payload.pageSize = state.pageSize.toString())
    router.push('?' + new URLSearchParams(payload).toString())
  }, [
    state.keyword,
    state.sorterKey,
    state.pager.page,
    state.selectedTag,
    state.hostCheckStatus,
    state.pageSize,
  ])

  function renderRelatedTags(tagIds: number[] = []) {
    return tagIds
      .map((id) => props.tags.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join('、')
  }

  const { run: onNameChange } = useDebounceFn(
    (keyword: string) => {
      setState({ keyword, pager: { ...state.pager, page: 1 } })
    },
    { wait: 500, leading: false, trailing: true }
  )

  async function onRemove(item: SelectBookmark) {
    const action = isUserSpace ? actDeleteUserBookmark : actDeletePublicBookmark
    await runAction(action({ id: item.id }), {
      okMsg: '书签已删除',
      onOk: refresh,
    })
  }

  function onPageChange(page: number) {
    setState({ pager: { ...state.pager, page } })
  }

  function onPageSizeChange(pageSize: number) {
    globalThis.localStorage?.setItem(getPageSizeCacheKey(pathname), String(pageSize))
    setState({
      pageSize,
      pager: { ...state.pager, page: 1 },
    })
  }

  function onChangeIsPinned(item: SelectBookmark, isPinned: boolean) {
    item.isPinned = isPinned
    mutate([...bookmarks])
    dataRef.current.loadingMutable = false
    const action = isUserSpace ? actUpdateUserBookmark : actUpdatePublicBookmark
    runAction(action({ id: item.id, isPinned })).then(refresh)
  }

  function toEditPage(item: SelectBookmark) {
    router.push((isUserSpace ? PageRoutes.User : PageRoutes.Admin).bookmarkSlug(item.id))
  }

  async function onCheckHost(item: SelectBookmark) {
    const action = isUserSpace ? actCheckUserBookmarkHost : actCheckPublicBookmarkHost
    setState({ checkingId: item.id })
    await runAction(action({ id: item.id }), {
      okMsg: '检测完成',
      onOk: refresh,
    })
    setState({ checkingId: null })
  }

  async function onStartCheckHostsTask() {
    const action = isUserSpace
      ? actStartUserBookmarkHostCheckTask
      : actStartPublicBookmarkHostCheckTask
    setState({ startingCheckHostsTask: true })
    const res = await runAction(action(), {
      onOk: (task) => {
        taskRunningRef.current = task?.finishedAt === null
        setState({ checkHostsTask: task || null })
        if (task?.finishedAt) refresh()
      },
    })
    if (res.ok) {
      addToast({
        color: 'success',
        title: '操作成功',
        description: res.data.total === 0 ? '没有待检测的站点' : '检测任务已启动。',
      })
    }
    setState({ startingCheckHostsTask: false })
  }

  function formatCheckedAt(checkedAt: Date | null) {
    if (!checkedAt) return ''
    return new Date(checkedAt).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatTaskFinishedAt(finishedAt: string | null | undefined) {
    if (!finishedAt) return ''
    return new Date(finishedAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  function getCheckHostsTaskTooltip() {
    const lines = ['24 小时内同一站点只会检测一次。']
    const finishedAt = formatTaskFinishedAt(state.checkHostsTask?.finishedAt)
    if (finishedAt) lines.push(`上次完成：${finishedAt}`)
    return lines.join('\n')
  }

  function renderHostCheckStatus(item: SelectBookmark) {
    if (item.hostCheckStatus === 'reachable') {
      return (
        <Chip
          size="sm"
          color="success"
          variant="flat"
          startContent={<span className={IconNames.Tabler.CIRCLE_CHECK} />}
        >
          可访问
        </Chip>
      )
    }

    if (item.hostCheckStatus === 'unreachable') {
      return (
        <Tooltip content={item.hostCheckErrorMessage || '不可访问'}>
          <Chip
            size="sm"
            color="danger"
            variant="flat"
            startContent={<span className={IconNames.Tabler.CIRCLE_X} />}
          >
            不可访问
          </Chip>
        </Tooltip>
      )
    }

    return (
      <Chip size="sm" color="default" variant="flat">
        未检测
      </Chip>
    )
  }

  return (
    <ListPageLayout title="书签列表">
      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end',
          !props.totalBookmarks && 'hidden'
        )}
      >
        <div className="w-full sm:order-1 sm:w-[220px]">
          <ReInput
            size="sm"
            placeholder="输入名称、地址"
            labelPlacement="outside"
            isClearable
            defaultValue={state.keyword}
            onValueChange={onNameChange}
            onClear={() => onNameChange('')}
          />
        </div>
        <div className="sm:order-2 sm:w-[180px]">
          <Select
            aria-label="选择标签"
            placeholder="选择标签"
            size="sm"
            selectedKeys={state.selectedTag ? [state.selectedTag] : []}
            onSelectionChange={(val) => {
              setState({
                selectedTag: getSelectionKey(val) || null,
                pager: { ...state.pager, page: 1 },
              })
            }}
            onChange={(event) => {
              setState({
                selectedTag: event.target.value || null,
                pager: { ...state.pager, page: 1 },
              })
            }}
          >
            {props.tags.map((tag) => (
              <SelectItem
                key={tag.id}
                startContent={tag.icon ? <ClientIcon icon={tag.icon} /> : null}
              >
                {tag.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="sm:order-3 sm:w-[150px]">
          <Select
            aria-label="选择检测状态"
            placeholder="检测状态"
            size="sm"
            selectedKeys={[state.hostCheckStatus]}
            onSelectionChange={(val) => {
              setState({
                hostCheckStatus: (getSelectionKey(val) || 'all') as typeof state.hostCheckStatus,
                pager: { ...state.pager, page: 1 },
              })
            }}
            onChange={(event) => {
              setState({
                hostCheckStatus: (event.target.value || 'all') as typeof state.hostCheckStatus,
                pager: { ...state.pager, page: 1 },
              })
            }}
          >
            {HOST_CHECK_STATUSES.map((item) => (
              <SelectItem key={item.key}>{item.name}</SelectItem>
            ))}
          </Select>
        </div>
        <Dropdown>
          <DropdownTrigger className="justify-start sm:order-4">
            {(function () {
              const target = SORTERS.find((item) => item.key === state.sorterKey)
              if (!target) return null
              return (
                <Button
                  variant="flat"
                  size="sm"
                  startContent={<span className={cn(target.iconCls, 'text-base')} />}
                >
                  {target.name}
                </Button>
              )
            })()}
          </DropdownTrigger>
          <DropdownMenu
            aria-label="sorter-menu"
            className="min-w-48"
            selectedKeys={[state.sorterKey]}
            selectionMode="single"
            onAction={(key) =>
              setState({ sorterKey: key as any, pager: { ...state.pager, page: 1 } })
            }
          >
            {SORTERS.map((item, idx) => (
              <DropdownItem
                key={item.key}
                startContent={<span className={item.iconCls} />}
                showDivider={idx === 1}
              >
                {item.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Tooltip content={<span className="whitespace-pre-line">{getCheckHostsTaskTooltip()}</span>}>
          <Button
            variant="flat"
            size="sm"
            className="justify-start sm:order-5"
            isDisabled={isCheckingHosts}
            isLoading={state.startingCheckHostsTask}
            startContent={
              isCheckingHosts || state.startingCheckHostsTask ? null : (
                <span className={cn(IconNames.Tabler.RADAR, 'text-base')} />
              )
            }
            onPress={onStartCheckHostsTask}
          >
            {isCheckingHosts ? (
              <span className="flex items-center gap-2">
                <Progress
                  type="circle"
                  percent={checkHostsPercent}
                  size={18}
                  showInfo={false}
                  strokeWidth={12}
                />
                检测中
              </span>
            ) : (
              '检测全部站点'
            )}
          </Button>
        </Tooltip>
      </div>

      <div className="mt-3 overflow-hidden">
        <Table aria-label="items table" className="px-0" key={props.tags?.length} removeWrapper>
          <TableHeader>
            <TableColumn className="w-[34%] min-w-40">网站</TableColumn>
            <TableColumn className="w-[16%] min-w-24">关联标签</TableColumn>
            <TableColumn className="w-[18%] min-w-24">检测状态</TableColumn>
            <TableColumn className="w-16">置顶</TableColumn>
            <TableColumn className="w-28">操作</TableColumn>
          </TableHeader>
          <TableBody<SelectBookmark>
            items={state.loading ? [] : bookmarks}
            isLoading={state.loading}
            loadingContent={<Spinner className="mt-12" label="Loading..." />}
            emptyContent={<EmptyListPlaceholder target="bookmark" />}
          >
            {(item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex w-full min-w-0 max-w-[300px] items-center gap-3 max-xs:max-w-36">
                      <span className="shrink-0">
                        <Favicon src={item.icon} showErrorIconOnFailed showSpinner />
                      </span>
                      <Tooltip content={item.url}>
                        <Link
                          href={item.url}
                          color="foreground"
                          isExternal
                          size="sm"
                          className="block min-w-0 truncate font-medium"
                        >
                          {item.name}
                        </Link>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-full min-w-0 max-w-36 truncate text-sm max-xs:max-w-20"
                      title={renderRelatedTags(item.relatedTagIds)}
                    >
                      {renderRelatedTags(item.relatedTagIds)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-24 flex-col gap-1">
                      {renderHostCheckStatus(item)}
                      {item.hostCheckedAt && (
                        <span className="text-default-400 text-xs">
                          {formatCheckedAt(item.hostCheckedAt)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={item.isPinned || false}
                      onValueChange={(v) => onChangeIsPinned(item, v)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex w-28 items-center">
                      <ReButton
                        variant="light"
                        className="text-2xl"
                        isIconOnly
                        color="primary"
                        isLoading={state.checkingId === item.id}
                        startContent={
                          state.checkingId === item.id ? null : (
                            <span className={IconNames.Tabler.RADAR} />
                          )
                        }
                        onClick={() => onCheckHost(item)}
                      />
                      <ReButton
                        color="danger"
                        variant="light"
                        isIconOnly
                        className="text-2xl"
                        startContent={<span className={IconNames.Tabler.TRASH} />}
                        popoverContent={
                          <div className="flex max-w-52 flex-col gap-4 p-4">
                            <p>确定删除「{item.name}」？</p>
                            <ReButton color="danger" size="sm" onClick={() => onRemove(item)}>
                              确定
                            </ReButton>
                          </div>
                        }
                      />
                      <ReButton
                        variant="light"
                        className="text-2xl"
                        isIconOnly
                        color="warning"
                        startContent={<span className={IconNames.Tabler.EDIT} />}
                        onClick={() => toEditPage(item)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            }}
          </TableBody>
        </Table>
      </div>
      {!state.loading && !!props.totalBookmarks && (
        <PaginationControls
          page={state.pager.page}
          total={state.pager.total}
          pageSize={state.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </ListPageLayout>
  )
}
