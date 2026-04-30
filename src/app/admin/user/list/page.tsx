'use client'

import { actDeleteUser, actFindUsers } from '@/actions'
import AdminPageTitle from '@/components/AdminPageTitle'
import { AdminSurfaceCard } from '@/components/AdminPageShell'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import type { SelectUser } from '@/controllers/User.controller'
import { findManyUsersSchema } from '@/controllers/schemas'
import { runAction } from '@/utils/client'
import { IconNames } from '@cfg'
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
} from '@heroui/react'
import { useDebounceFn, useRequest, useSetState, useUpdateEffect } from 'ahooks'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import z from 'zod'

const SORTERS = [
  { name: '注册时间降序', key: '-createTime', iconCls: IconNames.Tabler.SORT_DESC },
  { name: '注册时间升序', key: '+createTime', iconCls: IconNames.Tabler.SORT_ASC },
] as const

const PAGESIZE = 20

function formatDate(date: Date | null | undefined) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getDisplayName(user: SelectUser) {
  return user.name?.trim() || '未命名用户'
}

export default function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const session = useSession()
  const [state, setState] = useSetState({
    loading: true,
    sorterKey: (searchParams.get('sorterKey') || SORTERS[0].key) as (typeof SORTERS)[number]['key'],
    keyword: searchParams.get('keyword') || '',
    deletingUserId: '',
    pager: {
      page: Number(searchParams.get('page')) || 1,
      total: 1,
    },
  })

  const { data: users = [], refresh } = useRequest(
    async () => {
      const input: z.input<typeof findManyUsersSchema> = {
        limit: PAGESIZE,
        page: state.pager.page,
        keyword: state.keyword,
        sorterKey: state.sorterKey,
      }
      setState({ loading: true })
      const res = await runAction(actFindUsers(findManyUsersSchema.parse(input)))
      setState({ loading: false })
      if (!res.ok) return []
      setState((current) => ({
        pager: {
          ...current.pager,
          total: res.data.total <= PAGESIZE ? 1 : Math.ceil(res.data.total / PAGESIZE),
        },
      }))
      return res.data.list
    },
    {
      refreshDeps: [state.keyword, state.sorterKey, state.pager.page],
    }
  )

  useUpdateEffect(() => {
    const payload: Record<string, string> = {
      page: state.pager.page.toString(),
      sorterKey: state.sorterKey,
    }
    state.keyword && (payload.keyword = state.keyword)
    router.push('?' + new URLSearchParams(payload).toString())
  }, [state.keyword, state.sorterKey, state.pager.page])

  const { run: onKeywordChange } = useDebounceFn(
    (keyword: string) => {
      setState({ keyword, pager: { ...state.pager, page: 1 } })
    },
    { wait: 500, leading: false, trailing: true }
  )

  function onPageChange(page: number) {
    setState({ pager: { ...state.pager, page } })
  }

  async function onDeleteUser(user: SelectUser) {
    setState({ deletingUserId: user.id })
    await runAction(actDeleteUser({ id: user.id }), {
      okMsg: '用户已删除',
      onOk: async () => {
        if (users.length === 1 && state.pager.page > 1) {
          setState({ pager: { ...state.pager, page: state.pager.page - 1 } })
          return
        }
        await refresh()
      },
    })
    setState({ deletingUserId: '' })
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <AdminPageTitle title="用户列表" pathname="/admin/user/list" />

      <AdminSurfaceCard bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <div className="w-full sm:w-[240px]">
            <ReInput
              size="sm"
              placeholder="输入昵称、邮箱"
              labelPlacement="outside"
              isClearable
              defaultValue={state.keyword}
              onValueChange={onKeywordChange}
              onClear={() => onKeywordChange('')}
            />
          </div>
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
              className="min-w-44"
              selectedKeys={[state.sorterKey]}
              selectionMode="single"
              onAction={(key) =>
                setState({
                  sorterKey: key as (typeof SORTERS)[number]['key'],
                  pager: { ...state.pager, page: 1 },
                })
              }
            >
              {SORTERS.map((item) => (
                <DropdownItem key={item.key} startContent={<span className={item.iconCls} />}>
                  {item.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="mt-3 overflow-hidden">
          <Table aria-label="users table" removeWrapper>
            <TableHeader>
              <TableColumn>用户</TableColumn>
              <TableColumn className="max-xs:hidden">邮箱</TableColumn>
              <TableColumn>角色</TableColumn>
              <TableColumn className="max-xs:hidden">注册时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody<SelectUser>
              items={state.loading ? [] : users}
              isLoading={state.loading}
              loadingContent={<Spinner className="mt-12" label="Loading..." />}
              emptyContent="暂无用户"
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={item.image || undefined}
                        name={getDisplayName(item)}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{getDisplayName(item)}</div>
                        <div className="text-default-500 xs:hidden truncate text-xs">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-xs:hidden">
                    <div className="max-w-64 truncate">{item.email}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={item.role === 'admin' ? 'primary' : 'default'}
                    >
                      {item.role === 'admin' ? '管理员' : '普通用户'}
                    </Chip>
                  </TableCell>
                  <TableCell className="max-xs:hidden">{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <ReButton
                      isDisabled={session.data?.user.id === item.id}
                      isLoading={state.deletingUserId === item.id}
                      variant="light"
                      color="danger"
                      className="text-2xl"
                      isIconOnly
                      startContent={<span className={IconNames.Tabler.TRASH} />}
                      popoverContent={
                        <div className="flex max-w-[280px] flex-col gap-4 p-4">
                          <p>确定删除用户「{getDisplayName(item)}」？</p>
                          <ReButton
                            color="danger"
                            size="sm"
                            variant="shadow"
                            onClick={() => onDeleteUser(item)}
                          >
                            确定
                          </ReButton>
                        </div>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
      </AdminSurfaceCard>
    </div>
  )
}
