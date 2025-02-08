'use client'

import { useGlobalContext } from '@/app/ctx'
import ClientIcon from '@/components/ClientIcon'
import Favicon from '@/components/Favicon'
import ListPageLayout from '@/components/ListPageLayout'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import http from '@/lib/http'
import { ApiRoutes, IconNames, PageRoutes } from '@cfg'
import {
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
import toast from 'react-hot-toast'
import EmptyListPlaceholder from '../../components/EmptyListPlaceholder'

const DEFAULT_PAGESIZE = 20

const SORTERS = [
  { name: '创建时间降序', key: '-createTime', iconCls: IconNames.SORT_DESC },
  { name: '创建时间升序', key: '+createTime', iconCls: IconNames.SORT_ASC },
  { name: '更新时间降序', key: '-updateTime', iconCls: IconNames.SORT_DESC },
  { name: '更新时间升序', key: '+updateTime', iconCls: IconNames.SORT_ASC },
]

export default function BookmarkListPage() {
  const searchParams = useSearchParams()

  const [state, setState] = useSetState({
    loading: true,
    sorterKey: searchParams.get('sorterKey') || SORTERS[0].key,
    keyword: searchParams.get('keyword') || '',
    selectedTag: searchParams.get('tag'),
    bookmarks: [] as SelectPublicBookmark[],
    pager: {
      page: Number(searchParams.get('page')) || 1,
      total: 1,
    },
  })
  const dataRef = useRef({ loadingMutable: true })

  const { tags, totalBookmarks } = useGlobalContext()

  const router = useRouter()

  const { refresh } = useRequest(
    async () => {
      const payload = {
        page: state.pager.page.toString(),
        keyword: state.keyword,
        sorterKey: state.sorterKey,
        ...(state.selectedTag && { tagIds: state.selectedTag }),
      }
      dataRef.current.loadingMutable && setState({ loading: true })
      const { data } = await http.get(ApiRoutes.Public.BOOKMARK_LIST, payload)
      setState({ loading: false })
      dataRef.current.loadingMutable = true
      if (!data) return
      setState((state) => ({
        bookmarks: data.list,
        pager: {
          ...state.pager,
          total: data.total <= DEFAULT_PAGESIZE ? 1 : Math.round(data.total / DEFAULT_PAGESIZE) + 1,
        },
      }))
    },
    { refreshDeps: [state.keyword, state.sorterKey, state.pager.page, state.selectedTag] }
  )

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
      .map((id) => {
        const tag = tags.find((item) => item.id === id)
        return tag?.name
      })
      .filter(Boolean)
      .join('、')
  }

  const { run: onNameChange } = useDebounceFn(
    (keyword: string) => {
      setState({ keyword, pager: { ...state.pager, page: 1 } })
    },
    { wait: 500, leading: false, trailing: true }
  )

  async function onRemove(bookmark: SelectPublicBookmark) {
    await http.delete(ApiRoutes.Public.BOOKMARK, { id: bookmark.id })
    toast.success('删除成功')
    refresh()
  }

  function onEdit(bookmark: SelectPublicBookmark) {
    router.push(PageRoutes.Admin.bookmarkSlug(bookmark.id))
  }

  function onPageChange(page: number) {
    setState({ pager: { ...state.pager, page } })
  }

  function onChangeIsPinned(bookmark: SelectPublicBookmark, isPinned: boolean) {
    bookmark.isPinned = isPinned
    setState({ bookmarks: [...state.bookmarks] })
    dataRef.current.loadingMutable = false
    http.patch(ApiRoutes.Public.BOOKMARK, bookmark).then(() => refresh())
  }

  return (
    <ListPageLayout>
      <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-5', !totalBookmarks && 'hidden')}>
        <div className="inline-grid sm:col-end-4">
          <ReInput
            size="sm"
            placeholder="输入书签名称、地址"
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
            console.log(val)
            setState({ selectedTag: val.currentKey || null, pager: { ...state.pager, page: 1 } })
          }}
        >
          {tags.map((tag) => (
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
                <ReButton
                  variant="flat"
                  size="sm"
                  startContent={<span className={cn(target.iconCls, 'text-base')} />}
                >
                  {target.name}
                </ReButton>
              )
            })()}
          </DropdownTrigger>
          <DropdownMenu
            aria-label="sorter-menu"
            className="min-w-[12rem]"
            selectedKeys={[state.sorterKey]}
            selectionMode="single"
            onAction={(key) =>
              setState({ sorterKey: key as string, pager: { ...state.pager, page: 1 } })
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

      <Table aria-label="bookmarks table" className="mt-4 px-0" key={tags?.length}>
        <TableHeader>
          <TableColumn>图标</TableColumn>
          <TableColumn>名称</TableColumn>
          <TableColumn className="max-xs:hidden">地址</TableColumn>
          <TableColumn>关联标签</TableColumn>
          <TableColumn>置顶</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody
          items={state.loading ? [] : state.bookmarks}
          isLoading={state.loading}
          loadingContent={<Spinner className="mt-12" label="Loading..." />}
          emptyContent={<EmptyListPlaceholder href={PageRoutes.Admin.bookmarkSlug('new')} />}
        >
          {(bookmark) => {
            return (
              <TableRow key={bookmark.id}>
                <TableCell className="flex min-w-[2rem] items-center">
                  <Favicon src={bookmark.icon} showErrorIconOnFailed canShowSpinner />
                </TableCell>
                <TableCell>
                  <div className="max-w-96 truncate">{bookmark.name}</div>
                </TableCell>
                <TableCell className="max-w-10rem max-xs:hidden">
                  <Link href={bookmark.url} color="foreground" isExternal size="sm">
                    <div className="max-w-60 truncate pr-4">{bookmark.url}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="truncate text-sm max-xs:max-w-[6rem]">
                    {renderRelatedTags(bookmark.relatedTagIds)}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    size="sm"
                    isSelected={bookmark.isPinned || false}
                    onValueChange={(v) => onChangeIsPinned(bookmark, v)}
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
                        <p>确定删除书签「{bookmark.name}」？</p>
                        <ReButton color="danger" size="sm" onClick={() => onRemove(bookmark)}>
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
                    onClick={() => onEdit(bookmark)}
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

BookmarkListPage.SORTERS = SORTERS
