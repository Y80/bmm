'use client'

import type { ActionResult } from '@/actions/make-action'
import ClientIcon from '@/components/ClientIcon'
import ColorPicker from '@/components/ColorPicker'
import EmptyListPlaceholder from '@/components/EmptyListPlaceholder'
import ListPageLayout from '@/components/ListPageLayout'
import MyModal from '@/components/MyModal'
import SortTagModal from '@/components/SortTagModal'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { PaginationControls } from '@/components/ui'
import { findManyTagsSchema } from '@/controllers/schemas'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils/client'
import { IconNames, PageRoutes } from '@cfg'
import {
  cn,
  Selection,
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_CACHE_PREFIX = 'bmm:page-size:'

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

export type TagListPageProps = {
  allTags: SelectTag[]
  refreshAllTags: () => Promise<void>
  findTags: (input?: any) => ActionResult<any, any>
  removeTag: (tag: SelectTag) => Promise<void>
  removeTags: (ids: TagId[]) => Promise<void>
  changeTag: (changedTag: SelectTag) => Promise<void>
}

export default function TagListPage(props: TagListPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAdminSpace = usePageUtil().isAdminSpace
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const [colorPicker, setColorPicker] = useSetState({
    isOpen: false,
    defaultValue: '' as string | null,
    targetTagId: 0,
  })
  const [state, setState] = useSetState({
    loading: true,
    keyword: searchParams.get('keyword') || '',
    pageSize: Number(searchParams.get('pageSize')) || getCachedPageSize(pathname),
    totalItems: 0,
    pager: {
      page: Number(searchParams.get('page')) || 1,
      total: 1,
    },
  })

  const { refresh, data: tags = [] } = useRequest(
    async () => {
      const input = findManyTagsSchema.parse({
        limit: state.pageSize,
        page: state.pager.page,
        keyword: state.keyword || undefined,
      })
      setState({ loading: true })
      const res = await runAction(props.findTags(input))
      setState({ loading: false })
      if (!res.ok) return []
      const totalItems = res.data.total
      setState((s) => ({
        totalItems,
        pager: {
          ...s.pager,
          total: totalItems <= s.pageSize ? 1 : Math.ceil(totalItems / s.pageSize),
        },
      }))
      return res.data.list
    },
    {
      refreshDeps: [state.keyword, state.pageSize, state.pager.page],
    }
  )

  useUpdateEffect(() => {
    const payload: Record<string, string> = { page: state.pager.page.toString() }
    state.keyword && (payload.keyword = state.keyword)
    state.pageSize !== DEFAULT_PAGE_SIZE && (payload.pageSize = state.pageSize.toString())
    router.push('?' + new URLSearchParams(payload).toString())
  }, [state.keyword, state.pager.page, state.pageSize])

  const { run: onKeywordChange } = useDebounceFn(
    (keyword: string) => {
      setState({ keyword, pager: { ...state.pager, page: 1 } })
    },
    { wait: 500, leading: false, trailing: true }
  )

  const isAllSelected = selectedKeys === 'all'
  const selectedIds = isAllSelected
    ? tags.map((t: SelectTag) => t.id)
    : ([...selectedKeys] as TagId[])
  const hasSelection = isAllSelected || selectedIds.length > 0

  async function handleBatchDelete() {
    await props.removeTags(selectedIds)
    setSelectedKeys(new Set())
    refresh()
  }

  function getRelatedTagsName(tagsId?: TagId[]) {
    if (!tagsId?.length) return ''
    return tagsId
      .map((id) => props.allTags.find((tag) => tag.id === id))
      .map((tag) => tag?.name)
      .join('、')
  }

  function handleChangeIsMain(v: boolean, tag: SelectTag) {
    if (tag.isMain === v) return
    tag.isMain = v
    props.changeTag(tag)
  }

  function handleChangeColor(v: string) {
    const tag = tags.find((e: SelectTag) => e.id === colorPicker.targetTagId)!
    if (tag.color === v) return
    tag.color = v
    props.changeTag(tag)
  }

  function changeColor(tag: SelectTag) {
    setColorPicker({
      isOpen: true,
      defaultValue: tag.color,
      targetTagId: tag.id,
    })
  }

  function onPageChange(page: number) {
    setState({ pager: { ...state.pager, page } })
  }

  function onPageSizeChange(pageSize: number) {
    globalThis.localStorage?.setItem(getPageSizeCacheKey(pathname), String(pageSize))
    setState({ pageSize, pager: { ...state.pager, page: 1 } })
  }

  function toNewTagPage() {
    router.push((isAdminSpace ? PageRoutes.Admin : PageRoutes.User).tagSlug('new'))
  }

  return (
    <ListPageLayout
      title="标签列表"
      className="bg-white"
      titleActions={
        <div className="flex items-center gap-2">
          <ReButton
            color="primary"
            size="sm"
            startContent={<span className={IconNames.Tabler.PLUS} />}
            onClick={toNewTagPage}
          >
            新建标签
          </ReButton>
          <SortTagModal refreshTags={props.refreshAllTags} tags={props.allTags}>
            <ReButton
              variant="flat"
              size="sm"
              isDisabled={props.allTags.length < 2}
              startContent={<span className={cn(IconNames.Tabler.ARROWS_SORT, 'text-sm')} />}
            >
              排序
            </ReButton>
          </SortTagModal>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-[400px]">
          <ReInput
            size="sm"
            placeholder="输入名称或拼音"
            labelPlacement="outside"
            isClearable
            defaultValue={state.keyword}
            onValueChange={onKeywordChange}
            onClear={() => onKeywordChange('')}
          />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {hasSelection && (
            <ReButton
              color="danger"
              size="sm"
              variant="flat"
              startContent={<span className={cn(IconNames.Tabler.TRASH, 'text-sm')} />}
              onPress={() => {
                MyModal.open({
                  title: '确认删除',
                  children: (
                    <p>
                      确定删除选中的 {selectedIds.length} 个标签？
                    </p>
                  ),
                  okButtonProps: { color: 'danger' },
                  onOk: handleBatchDelete,
                })
              }}
            >
              删除 {selectedIds.length} 项
            </ReButton>
          )}
        </div>
      </div>

      <div className="overflow-hidden">
        <Table
          aria-label="tags table"
          classNames={{
            th: 'first:w-10 first:min-w-10 first:px-2',
            td: 'first:w-10 first:min-w-10 first:px-2',
          }}
          removeWrapper
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader>
            <TableColumn className="px-3">图标</TableColumn>
            <TableColumn className="px-3">名称</TableColumn>
            <TableColumn className="max-xs:hidden px-3">主题色</TableColumn>
            <TableColumn className="max-xs:hidden px-3">主标签</TableColumn>
            <TableColumn className="px-3">关联标签</TableColumn>
            <TableColumn className="px-3">操作</TableColumn>
          </TableHeader>
          <TableBody
            items={state.loading ? [] : tags}
            isLoading={state.loading}
            loadingContent={<Spinner className="mt-12" label="Loading..." />}
            emptyContent={<EmptyListPlaceholder target="tag" />}
          >
            {(tag: SelectTag) => (
              <TableRow key={tag.id}>
                <TableCell className="text-foreground-700 max-xs:text-xl text-3xl">
                  {tag.icon ? (
                    <ClientIcon
                      icon={tag.icon}
                      color={tag.color || undefined}
                      className="size-7 text-3xl"
                    />
                  ) : null}
                </TableCell>
                <TableCell className="max-xs:text-sm">{tag.name}</TableCell>
                <TableCell className="max-xs:hidden w-24 pr-8 md:w-40">
                  {tag.color ? (
                    <div
                      className="h-8 w-full cursor-pointer rounded-lg border-2 transition duration-500"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => changeColor(tag)}
                    />
                  ) : (
                    <ReButton
                      tooltip="设置标签主题色"
                      variant="ghost"
                      className="w-full"
                      size="sm"
                      onPress={() => changeColor(tag)}
                    >
                      设 置
                    </ReButton>
                  )}
                </TableCell>
                <TableCell className="max-xs:hidden">
                  <Switch
                    aria-label="is main switch"
                    size="sm"
                    isSelected={tag.isMain || false}
                    onValueChange={(v) => handleChangeIsMain(v, tag)}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-xs:max-w-24 truncate text-sm">
                    {getRelatedTagsName(tag.relatedTagIds)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex w-20 items-center">
                    <ReButton
                      isIconOnly
                      color="danger"
                      tooltip="删除标签"
                      aria-label={`删除标签 ${tag.name}`}
                      onPress={() => {
                        MyModal.open({
                          title: '确认删除',
                          children: <p>确定删除标签「{tag.name}」？</p>,
                          okButtonProps: { color: 'danger' },
                          onOk: () => props.removeTag(tag).then(refresh),
                        })
                      }}
                    >
                      <span className={IconNames.Tabler.TRASH} />
                    </ReButton>
                    <ReButton
                      isIconOnly
                      color="warning"
                      tooltip="编辑标签"
                      aria-label={`编辑标签 ${tag.name}`}
                      onPress={() =>
                        router.push(
                          (isAdminSpace ? PageRoutes.Admin : PageRoutes.User).tagSlug(tag.id)
                        )
                      }
                    >
                      <span className={IconNames.Tabler.EDIT} />
                    </ReButton>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!state.loading && tags.length > 0 && (
        <PaginationControls
          page={state.pager.page}
          total={state.pager.total}
          pageSize={state.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          totalItems={state.totalItems}
        />
      )}
      <ColorPicker
        {...colorPicker}
        onClose={() => setColorPicker({ isOpen: false })}
        onSelect={handleChangeColor}
      />
    </ListPageLayout>
  )
}
