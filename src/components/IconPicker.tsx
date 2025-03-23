'use client'

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Select,
  SelectItem,
  Spinner,
  cn,
} from '@heroui/react'
import { useMemoizedFn, useSetState, useThrottleEffect, useUpdateEffect } from 'ahooks'
import { useEffect, useMemo } from 'react'

// https://iconify.design/docs/

// 获取 Tabler 集合中的所有图标名称
// https://api.iconify.design/collection?prefix=tabler

// 图标集合：Tabler，获取 Search、Box 两个图标的数据
// https://api.iconify.design/tabler.json?icons=search,box

// 图标集合：Tabler，要搜索的关键词：search
// https://api.iconify.design/search?prefix=tabler&query=search

interface FetchCollectionRes {
  prefix: string
  total: number
  aliases: Record<string, string>
  // 分类图标
  categories?: Record<string, string[]>
  // 未分类图标
  uncategorized?: string[]
}

interface FetchIconsRes {
  aliases: Record<string, string>
  width: number
  height: number
  prefix: string
  icons: Record<string, { body: string }>
}

export interface SelectedIcon {
  prefix: string
  name: string
  body: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect?: (icon: SelectedIcon) => void
}

const ICON_SETS = [
  { prefix: 'mdi', title: 'Material' },
  { prefix: 'tabler', title: 'Tabler' },
  { prefix: 'solar', title: 'Solar' },
  { prefix: 'uil', title: 'Unicons' },
  { prefix: 'basil', title: 'Basil' },
] as const

// 每次获取这么多数据
const PAGESIZE = 6 * 30
export default function IconPicker(props: Props) {
  const [state, setState] = useSetState({
    input: '',
    icon: {
      prefix: ICON_SETS[0].prefix as string,
      names: [] as string[],
      objects: [] as { name: string; body: string }[],
    },
    pagination: {
      page: 1,
      total: 1,
    },
    loading: false,
  })

  const fetchAllIconNames = useMemoizedFn(async function (prefix: string) {
    const res: FetchCollectionRes = await fetch(
      `https://api.iconify.design/collection?prefix=${prefix}`
    ).then((r) => r.json())
    let names = [] as string[]
    if (res.categories) {
      names = Object.values(res.categories).flat()
    }
    if (Array.isArray(res.uncategorized)) {
      names = names.concat(res.uncategorized)
    }
    setIconNames(names)
  })

  function setIconNames(names: string[] = []) {
    setState((state) => {
      return {
        icon: { ...state.icon, names, objects: [] },
        pagination: {
          page: 1,
          total: Math.round(names.length / PAGESIZE),
        },
      }
    })
  }

  function onChangeIconSet(prefix: string) {
    setState({ icon: { ...state.icon, prefix, names: [] } })
    if (!state.input) {
      fetchAllIconNames(prefix)
    } else {
      searchIcons(prefix, state.input)
    }
  }

  const fetchIconData = useMemoizedFn(async () => {
    const startIdx = (state.pagination.page - 1) * PAGESIZE
    const endIdx = startIdx + PAGESIZE
    const iconNames = state.icon.names.slice(startIdx, endIdx)
    if (!iconNames.length) return
    setState({ loading: true })
    let data: FetchIconsRes = await fetch(
      `https://api.iconify.design/${state.icon.prefix}.json?icons=${iconNames.join(',')}`
    ).then((r) => r.json())
    const iconObjects = Object.keys(data.icons).map((name) => ({
      name,
      body: data.icons[name].body,
    }))
    setState({
      loading: false,
      icon: { ...state.icon, objects: iconObjects },
    })
  })

  const searchIcons = useMemoizedFn(function (prefix: string, input: string) {
    fetch(`https://api.iconify.design/search?prefix=${prefix}&query=${input}`)
      .then((rsp) => rsp.json())
      .then((data) => {
        setIconNames(data.icons.map((el: string) => el.replace(prefix + ':', '')))
      })
  })

  useEffect(() => {
    fetchIconData()
  }, [fetchIconData, state.icon.names])

  useUpdateEffect(() => {
    fetchIconData()
  }, [state.pagination.page])

  // 根据用户输入，搜索图标
  useThrottleEffect(
    () => {
      if (!state.input) {
        fetchAllIconNames(state.icon.prefix)
      } else {
        searchIcons(state.icon.prefix, state.input)
      }
    },
    [state.input],
    {
      wait: 500,
      leading: false,
    }
  )

  const showPagination = useMemo(() => state.pagination.total > 1, [state.pagination.total])

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} backdrop="blur">
      <ModalContent>
        <ModalHeader>选取图标</ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex gap-2">
            <Input
              size="sm"
              placeholder="Filter icons"
              labelPlacement="outside"
              isClearable
              value={state.input}
              onValueChange={(v) => setState({ input: v })}
              startContent={<span className="icon-[tabler--search] size-5" />}
            />
            <Select
              className="w-56"
              size="sm"
              aria-label="icon set"
              labelPlacement="outside-left"
              selectedKeys={[state.icon.prefix]}
              onChange={(e) => onChangeIconSet(e.target.value)}
            >
              {ICON_SETS.map((item) => (
                <SelectItem key={item.prefix} textValue={item.prefix}>
                  {item.title}
                </SelectItem>
              ))}
            </Select>
          </div>
          <ScrollShadow
            className={cn('-mr-4 h-96 overflow-scroll pr-4', !showPagination && 'h-[416px]')}
          >
            {!state.icon.names.length && (
              <div className="h-full text-sm text-gray-400 flex-center">暂无内容</div>
            )}
            {state.loading && (
              <div className="h-full flex-center">
                <Spinner />
              </div>
            )}
            <div className="grid grid-cols-6 justify-items-center gap-2">
              {(state.loading ? [] : state.icon.objects).map((item) => (
                <span
                  key={item.name}
                  title={item.name}
                  className="cursor-pointer rounded-xl p-1.5 text-4xl transition-all hover:scale-90 hover:bg-foreground-200"
                  onClick={() => {
                    props.onSelect?.({
                      name: item.name,
                      prefix: state.icon.prefix,
                      body: item.body,
                    })
                    props.onClose()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: item.body }}
                  />
                </span>
              ))}
            </div>
          </ScrollShadow>
          <div className={cn('flex h-8 justify-center', !showPagination && '!h-0')}>
            <Pagination
              size="sm"
              isCompact
              showControls={showPagination}
              page={state.pagination.page}
              total={state.pagination.total}
              onChange={(page) => setState({ pagination: { ...state.pagination, page } })}
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
