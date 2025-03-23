'use client'

import {
  actDeletePublicBookmark,
  actDeleteUserBookmark,
  actFindPublicBookmarks,
  actFindUserBookmarks,
  actUpdatePublicBookmark,
  actUpdateUserBookmark,
} from '@/actions'
import {
  ClientIcon,
  EmptyListPlaceholder,
  Favicon,
  ListPageLayout,
  ReButton,
  ReInput,
} from '@/components'
import { SelectPublicBookmark } from '@/controllers'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils'
import { DEFAULT_BOOKMARK_PAGESIZE, IconNames, PageRoutes } from '@cfg'
import {
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Pagination,
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
} from '@heroui/react'
import { useDebounceFn, useRequest, useSetState, useUpdateEffect } from 'ahooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

const SORTERS = [
  { name: '创建时间降序', key: '-createTime', iconCls: IconNames.SORT_DESC },
  { name: '创建时间升序', key: '+createTime', iconCls: IconNames.SORT_ASC },
  { name: '更新时间降序', key: '-updateTime', iconCls: IconNames.SORT_DESC },
  { name: '更新时间升序', key: '+updateTime', iconCls: IconNames.SORT_ASC },
] as const

export type BookmarkListPageProps = {
  tags: SelectTag[]
  totalBookmarks: number
}

export default function BookmarkListPage(props: BookmarkListPageProps) {
  const isUserSpace = usePageUtil().isUserSpace
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useSetState({
    loading: true,
    sorterKey: (searchParams.get('sorterKey') || SORTERS[0].key) as (typeof SORTERS)[number]['key'],
    keyword: searchParams.get('keyword') || '',
    selectedTag: searchParams.get('tag'),
    pager: {
      page: Number(searchParams.get('page')) || 1,
      total: 1,
    },
  })
  const dataRef = useRef({ loadingMutable: true })

  const {
    refresh,
    data: bookmarks = [],
    mutate,
  } = useRequest(
    async () => {
      const input: typeof findManyBookmarksSchema._input = {
        limit: 20,
        page: state.pager.page.toString(),
        keyword: state.keyword,
        sorterKey: state.sorterKey,
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
            res.data.total <= DEFAULT_BOOKMARK_PAGESIZE
              ? 1
              : Math.round(res.data.total / DEFAULT_BOOKMARK_PAGESIZE) + 1,
        },
      }))
      return res.data.list
    },
    {
      ready: isUserSpace !== null,
      refreshDeps: [
        state.keyword,
        state.sorterKey,
        state.pager.page,
        state.selectedTag,
        isUserSpace,
      ],
    }
  )

  // 将状态同步到 URL 查询参数中
  useUpdateEffect(() => {
    const payload: Record<string, string> = {
      page: state.pager.page.toString(),
      sorterKey: state.sorterKey,
    }
    state.selectedTag && (payload.tag = state.selectedTag)
    state.keyword && (payload.keyword = state.keyword)
    router.push('?' + new URLSearchParams(payload).toString())
  }, [state.keyword, state.sorterKey, state.pager.page, state.selectedTag])

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

  async function onRemove(item: SelectPublicBookmark) {
    const action = isUserSpace ? actDeleteUserBookmark : actDeletePublicBookmark
    await runAction(action({ id: item.id }), {
      okMsg: '书签已删除',
      onOk: refresh,
    })
  }

  function onPageChange(page: number) {
    setState({ pager: { ...state.pager, page } })
  }

  function onChangeIsPinned(item: SelectPublicBookmark, isPinned: boolean) {
    item.isPinned = isPinned
    mutate([...bookmarks])
    dataRef.current.loadingMutable = false
    const action = isUserSpace ? actUpdateUserBookmark : actUpdatePublicBookmark
    runAction(action(item)).then(refresh)
  }

  function toEditPage(item: SelectPublicBookmark) {
    router.push((isUserSpace ? PageRoutes.User : PageRoutes.Admin).bookmarkSlug(item.id))
  }

  return (
    <ListPageLayout>
      <div
        className={cn('grid grid-cols-2 gap-2 sm:grid-cols-5', !props.totalBookmarks && 'hidden')}
      >
        <ReButton
          variant="flat"
          size="sm"
          className="w-20"
          startContent={<span className={cn(IconNames.PLUS, 'text-sm')} />}
          href={(isUserSpace ? PageRoutes.User : PageRoutes.Admin).bookmarkSlug('new')}
        >
          新建
        </ReButton>
        <div className="inline-grid sm:col-end-4">
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
        <Select
          aria-label="选择标签"
          placeholder="选择标签"
          size="sm"
          selectedKeys={state.selectedTag ? [state.selectedTag] : []}
          onSelectionChange={(val) => {
            setState({ selectedTag: val.currentKey || null, pager: { ...state.pager, page: 1 } })
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
        <Dropdown>
          <DropdownTrigger className="justify-start">
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
            className="min-w-[12rem]"
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
      </div>

      <Table aria-label="items table" className="mt-4 px-0" key={props.tags?.length}>
        <TableHeader>
          <TableColumn>图标</TableColumn>
          <TableColumn>名称</TableColumn>
          <TableColumn className="max-xs:hidden">地址</TableColumn>
          <TableColumn>关联标签</TableColumn>
          <TableColumn>置顶</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody
          items={state.loading ? [] : bookmarks}
          isLoading={state.loading}
          loadingContent={<Spinner className="mt-12" label="Loading..." />}
          emptyContent={<EmptyListPlaceholder target="bookmark" />}
        >
          {(item) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="flex min-w-8 items-center">
                  <Favicon src={item.icon} showErrorIconOnFailed showSpinner />
                </TableCell>
                <TableCell>
                  <div className="max-w-60 truncate">{item.name}</div>
                </TableCell>
                <TableCell className="max-xs:hidden">
                  <Link
                    href={item.url}
                    color="foreground"
                    isExternal
                    size="sm"
                    className="block max-w-52 truncate"
                  >
                    {item.url}
                  </Link>
                </TableCell>
                <TableCell>
                  <div
                    className="max-w-32 truncate text-sm max-xs:max-w-[6rem]"
                    title={renderRelatedTags(item.relatedTagIds)}
                  >
                    {renderRelatedTags(item.relatedTagIds)}
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
                  <ReButton
                    color="danger"
                    variant="light"
                    isIconOnly
                    className="text-2xl"
                    startContent={<span className={IconNames.TRASH} />}
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
                    startContent={<span className={IconNames.EDIT} />}
                    onClick={() => toEditPage(item)}
                  />
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
      {!state.loading && state.pager.total > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            showShadow
            showControls
            page={state.pager.page}
            total={state.pager.total}
            onChange={onPageChange}
          />
        </div>
      )}
    </ListPageLayout>
  )
}
