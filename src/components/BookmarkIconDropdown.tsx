'use client'

import Favicon from '@/components/Favicon'
import { buildWebsiteIconCandidates, probeWebsiteIcon } from '@/utils/website-icon'
import { IconNames } from '@cfg'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  addToast,
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
} from '@heroui/react'
import { useSetState, useUpdateEffect } from 'ahooks'
import { useEffect, useRef } from 'react'

type Props = {
  url: string
  onSelectIcon: (icon: string) => void
}

type ThirdPartyIconApiConfig = {
  id: string
  name: string
  srcTemplate: string
}

type ThirdPartyIconApiConfigErrors = {
  name?: string
  srcTemplate?: string
}

const THIRD_PARTY_ICON_API_STORAGE_KEY = 'bookmark-third-party-icon-api-configs'
const DEFAULT_THIRD_PARTY_ICON_API_LIST = [
  { name: 'Google', srcTemplate: 'https://www.google.com/s2/favicons?domain={host}' },
  { name: 'DuckDuckGo', srcTemplate: 'https://icons.duckduckgo.com/ip3/{host}.ico' },
  { name: 'Yandex', srcTemplate: 'https://favicon.yandex.net/favicon/{host}' },
  { name: '令川', srcTemplate: 'https://api.lcll.cc/favicon?host={host}' },
  { name: 'Favicon.im', srcTemplate: 'https://favicon.im/{host}' },
  { name: 'Xinac', srcTemplate: 'https://api.xinac.net/icon/?url={host}' },
  { name: '流浪猫', srcTemplate: 'https://api.cxr.cool/ico/?url={host}' },
] as const

function createThirdPartyIconApiConfig(
  value: Partial<Omit<ThirdPartyIconApiConfig, 'id'>> = {}
): ThirdPartyIconApiConfig {
  return {
    id: createThirdPartyIconApiConfigId(),
    name: value.name || '',
    srcTemplate: value.srcTemplate || '',
  }
}

function createThirdPartyIconApiConfigId() {
  return (
    globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

function cloneThirdPartyIconApiConfigs(list: ThirdPartyIconApiConfig[]) {
  return list.map((item) => ({ ...item }))
}

function getDefaultThirdPartyIconApiConfigs() {
  return DEFAULT_THIRD_PARTY_ICON_API_LIST.map((item) => createThirdPartyIconApiConfig(item))
}

function normalizeThirdPartyIconApiConfigs(input: unknown) {
  if (!Array.isArray(input)) return null

  return input.reduce((acc, item) => {
    if (!item || typeof item !== 'object') return acc

    const target = item as Partial<ThirdPartyIconApiConfig>
    if (typeof target.name !== 'string' || typeof target.srcTemplate !== 'string') return acc

    acc.push({
      id:
        typeof target.id === 'string' && target.id ? target.id : createThirdPartyIconApiConfigId(),
      name: target.name,
      srcTemplate: target.srcTemplate,
    })
    return acc
  }, [] as ThirdPartyIconApiConfig[])
}

function resolveThirdPartyIconApiSrc(srcTemplate: string, host: string) {
  return srcTemplate.replaceAll('{host}', host)
}

function includesThirdPartyIconApiHostPlaceholder(srcTemplate: string) {
  return srcTemplate.includes('{host}')
}

function isValidThirdPartyIconApiSrcTemplate(srcTemplate: string) {
  try {
    new URL(resolveThirdPartyIconApiSrc(srcTemplate, 'example.com'))
    return true
  } catch {
    return false
  }
}

export default function BookmarkIconDropdown(props: Props) {
  const parsedUrl = URL.canParse(props.url) ? new URL(props.url) : null
  const [state, setState] = useSetState({
    iconLoading: false,
    iconDropdownOpen: false,
    iconDropdownRenderKey: 0,
    probePathIndex: 0,
    probeResult: '' as '' | 'success' | 'failed',
    probeMatchedIcon: '',
    isOpenThirdPartyIconApiConfig: false,
    thirdPartyIconApis: getDefaultThirdPartyIconApiConfigs(),
    editingThirdPartyIconApis: getDefaultThirdPartyIconApiConfigs(),
    thirdPartyIconApiErrors: {} as Record<string, ThirdPartyIconApiConfigErrors>,
  })
  const hasValidUrl = !!parsedUrl
  const siteIcons = hasValidUrl ? buildWebsiteIconCandidates(props.url) : []
  const probeRequestIdRef = useRef(0)
  const probeStartedUrlRef = useRef('')
  const latestUrlRef = useRef(props.url)
  const shouldScrollThirdPartyIconApiListToBottomRef = useRef(false)
  const thirdPartyIconApiListEndRef = useRef<HTMLDivElement>(null)
  const thirdPartyIconApiItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const thirdPartyIconPreviewHost = parsedUrl ? parsedUrl.host : 'example.com'
  const thirdPartyIconApiSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function resetProbeState() {
    probeRequestIdRef.current += 1
    probeStartedUrlRef.current = ''
    setState({
      iconLoading: false,
      probePathIndex: 0,
      probeResult: '',
      probeMatchedIcon: '',
    })
  }

  async function detectWebsiteIcon(targetUrl: string) {
    if (!URL.canParse(targetUrl) || state.iconLoading) return
    if (probeStartedUrlRef.current === targetUrl) return

    const requestId = probeRequestIdRef.current + 1
    probeRequestIdRef.current = requestId
    probeStartedUrlRef.current = targetUrl

    setState({ iconLoading: true, probePathIndex: 0, probeResult: '', probeMatchedIcon: '' })
    const icon = await probeWebsiteIcon(targetUrl)

    if (
      requestId !== probeRequestIdRef.current ||
      latestUrlRef.current !== targetUrl ||
      probeStartedUrlRef.current !== targetUrl
    )
      return

    setState({
      iconLoading: false,
      probeResult: icon ? 'success' : 'failed',
      probeMatchedIcon: icon,
    })
  }

  useUpdateEffect(() => {
    if (!state.iconDropdownOpen) return

    if (hasValidUrl) {
      resetProbeState()
      detectWebsiteIcon(props.url)
      return
    }

    resetProbeState()
  }, [props.url, hasValidUrl])

  useEffect(() => {
    latestUrlRef.current = props.url
  }, [props.url])

  useEffect(() => {
    const value = globalThis.localStorage?.getItem(THIRD_PARTY_ICON_API_STORAGE_KEY)
    if (value === null) return

    try {
      const parsed = JSON.parse(value)
      const nextConfigs = normalizeThirdPartyIconApiConfigs(parsed)
      if (!nextConfigs) return
      if (!nextConfigs.length && Array.isArray(parsed) && parsed.length > 0) return

      setState({
        thirdPartyIconApis: nextConfigs,
        editingThirdPartyIconApis: cloneThirdPartyIconApiConfigs(nextConfigs),
      })
    } catch {}
  }, [setState])

  useEffect(() => {
    if (
      !state.isOpenThirdPartyIconApiConfig ||
      !shouldScrollThirdPartyIconApiListToBottomRef.current
    ) {
      return
    }

    shouldScrollThirdPartyIconApiListToBottomRef.current = false
    window.requestAnimationFrame(() => {
      thirdPartyIconApiListEndRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      })
    })
  }, [state.editingThirdPartyIconApis.length, state.isOpenThirdPartyIconApiConfig])

  useEffect(() => {
    if (!state.iconLoading || !state.iconDropdownOpen || siteIcons.length < 2) return

    const timer = window.setInterval(() => {
      setState((s) => ({ ...s, probePathIndex: (s.probePathIndex + 1) % siteIcons.length }))
    }, 100)

    return () => window.clearInterval(timer)
  }, [setState, siteIcons.length, state.iconDropdownOpen, state.iconLoading])

  function openThirdPartyIconApiConfig() {
    setState({
      iconDropdownOpen: false,
      iconDropdownRenderKey: state.iconDropdownRenderKey + 1,
      isOpenThirdPartyIconApiConfig: true,
      editingThirdPartyIconApis: cloneThirdPartyIconApiConfigs(state.thirdPartyIconApis),
      thirdPartyIconApiErrors: {},
    })
  }

  function closeThirdPartyIconApiConfig() {
    setState({ isOpenThirdPartyIconApiConfig: false, thirdPartyIconApiErrors: {} })
  }

  function addThirdPartyIconApiConfig() {
    shouldScrollThirdPartyIconApiListToBottomRef.current = true
    setState((s) => ({
      ...s,
      editingThirdPartyIconApis: [...s.editingThirdPartyIconApis, createThirdPartyIconApiConfig()],
    }))
  }

  function restoreDefaultThirdPartyIconApiConfigs() {
    setState({
      editingThirdPartyIconApis: getDefaultThirdPartyIconApiConfigs(),
      thirdPartyIconApiErrors: {},
    })
    addToast({
      color: 'success',
      title: '已恢复默认配置',
      description: '点击保存后生效',
    })
  }

  function updateThirdPartyIconApiConfig(
    id: ThirdPartyIconApiConfig['id'],
    key: 'name' | 'srcTemplate',
    value: string
  ) {
    setState((s) => ({
      ...s,
      editingThirdPartyIconApis: s.editingThirdPartyIconApis.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
      thirdPartyIconApiErrors: {
        ...s.thirdPartyIconApiErrors,
        [id]: {
          ...s.thirdPartyIconApiErrors[id],
          [key]: undefined,
        },
      },
    }))
  }

  function removeThirdPartyIconApiConfig(id: ThirdPartyIconApiConfig['id']) {
    setState((s) => ({
      ...s,
      editingThirdPartyIconApis: s.editingThirdPartyIconApis.filter((item) => item.id !== id),
      thirdPartyIconApiErrors: Object.fromEntries(
        Object.entries(s.thirdPartyIconApiErrors).filter(([itemId]) => itemId !== id)
      ),
    }))
  }

  function onThirdPartyIconApiDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = state.editingThirdPartyIconApis.findIndex((item) => item.id === active.id)
    const newIndex = state.editingThirdPartyIconApis.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    setState({
      editingThirdPartyIconApis: arrayMove(state.editingThirdPartyIconApis, oldIndex, newIndex),
    })
  }

  function saveThirdPartyIconApiConfigs() {
    const nextConfigs = state.editingThirdPartyIconApis.map((item) => ({
      ...item,
      name: item.name.trim(),
      srcTemplate: item.srcTemplate.trim(),
    }))
    const nextErrors = {} as Record<string, ThirdPartyIconApiConfigErrors>
    let firstInvalidId = ''

    for (const item of nextConfigs) {
      if (!item.name || !item.srcTemplate) {
        nextErrors[item.id] = {
          name: !item.name ? '请输入名称' : undefined,
          srcTemplate: !item.srcTemplate ? '请输入地址模板' : undefined,
        }
        firstInvalidId ||= item.id
        continue
      }

      if (!includesThirdPartyIconApiHostPlaceholder(item.srcTemplate)) {
        nextErrors[item.id] = {
          ...nextErrors[item.id],
          srcTemplate: '地址模板中必须包含 {host}',
        }
        firstInvalidId ||= item.id
        continue
      }

      if (!isValidThirdPartyIconApiSrcTemplate(item.srcTemplate)) {
        nextErrors[item.id] = {
          ...nextErrors[item.id],
          srcTemplate: '请输入有效的地址模板',
        }
        firstInvalidId ||= item.id
      }
    }

    if (Object.keys(nextErrors).length) {
      setState({ thirdPartyIconApiErrors: nextErrors })
      addToast({
        color: 'warning',
        title: '请先修正配置项',
      })
      window.requestAnimationFrame(() => {
        thirdPartyIconApiItemRefs.current[firstInvalidId]?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        })
      })
      return
    }

    globalThis.localStorage?.setItem(THIRD_PARTY_ICON_API_STORAGE_KEY, JSON.stringify(nextConfigs))
    setState({
      thirdPartyIconApis: nextConfigs,
      editingThirdPartyIconApis: cloneThirdPartyIconApiConfigs(nextConfigs),
      isOpenThirdPartyIconApiConfig: false,
      thirdPartyIconApiErrors: {},
    })
    addToast({
      color: 'success',
      title: '配置已保存',
    })
  }

  if (!hasValidUrl) return null

  const { host } = parsedUrl
  const list = state.thirdPartyIconApis.map((item) => ({
    name: item.name,
    src: resolveThirdPartyIconApiSrc(item.srcTemplate, host),
  }))
  const currentProbePath = siteIcons[state.probePathIndex]
  const probeLabel = state.iconLoading
    ? `${new URL(currentProbePath).pathname}`
    : state.probeResult === 'success'
      ? new URL(state.probeMatchedIcon).pathname
      : state.probeResult === 'failed'
        ? '常见路径探测失败'
        : '打开下拉框后自动探测'

  return (
    <>
      <Dropdown
        key={state.iconDropdownRenderKey}
        placement="right-start"
        onOpenChange={(isOpen) => {
          setState({ iconDropdownOpen: isOpen })
          if (!isOpen) {
            resetProbeState()
            return
          }
          if (URL.canParse(props.url)) {
            detectWebsiteIcon(props.url)
            return
          }
          resetProbeState()
        }}
      >
        <DropdownTrigger>
          <Button isIconOnly size="sm" className="bg-transparent">
            <span className={cn(IconNames.Tabler.API, 'text-2xl')} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownSection title="站点路径探测">
            <DropdownItem
              key="probe-status"
              textValue={probeLabel}
              className="opacity-100"
              isDisabled={state.iconLoading || state.probeResult === 'failed'}
              onClick={() =>
                state.probeResult === 'success' &&
                state.probeMatchedIcon &&
                props.onSelectIcon(state.probeMatchedIcon)
              }
            >
              <div className="flex-items-center justify-between gap-4">
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    state.probeResult === 'failed' && 'text-warning'
                  )}
                >
                  {probeLabel}
                </span>
                {state.iconLoading ? (
                  <span className={cn(IconNames.Tabler.LOADER, 'animate-spin text-lg')} />
                ) : state.probeResult === 'success' && state.probeMatchedIcon ? (
                  <Favicon
                    size={20}
                    src={state.probeMatchedIcon}
                    showSpinner
                    className="border"
                    disableLazyLoading
                    showErrorIconOnFailed
                  />
                ) : state.probeResult === 'failed' ? (
                  <span className={cn(IconNames.Tabler.ALERT_CIRCLE, 'text-warning text-lg')} />
                ) : (
                  <span className={cn(IconNames.Tabler.SEARCH, 'text-lg')} />
                )}
              </div>
            </DropdownItem>
          </DropdownSection>
          <DropdownItem
            key="third-party-icon-api-settings"
            textValue="第三方 API 获取图标设置"
            isReadOnly
            className="opacity-100 data-[hover=true]:bg-transparent"
          >
            <div className="flex-items-center justify-between gap-2">
              <span className="text-foreground-500 text-sm">第三方 API 获取图标</span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="设置图标"
                className="text-foreground-500 -mr-1 h-6"
                onPress={openThirdPartyIconApiConfig}
              >
                <span className={cn(IconNames.Huge.SETTINGS, 'text-base')} />
              </Button>
            </div>
          </DropdownItem>
          <DropdownSection aria-label="第三方 API 获取图标">
            {list.length ? (
              list.map((item) => (
                <DropdownItem
                  key={item.name}
                  textValue={item.name}
                  onClick={() => props.onSelectIcon(item.src)}
                >
                  <div className="flex-items-center justify-between">
                    <span>{item.name}</span>
                    <Favicon
                      size={20}
                      src={item.src}
                      showSpinner
                      className="border"
                      disableLazyLoading
                      showErrorIconOnFailed
                    />
                  </div>
                </DropdownItem>
              ))
            ) : (
              <DropdownItem key="empty-third-party-icon-api" isDisabled>
                暂无 API 配置
              </DropdownItem>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      <Modal
        isOpen={state.isOpenThirdPartyIconApiConfig}
        onClose={closeThirdPartyIconApiConfig}
        backdrop="blur"
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex-items-center gap-2">
            <span className={cn(IconNames.Huge.SETTINGS, 'text-xl')} />
            <span>第三方图标 API 配置</span>
          </ModalHeader>
          <ModalBody className="pb-2">
            <div className="text-foreground-500 space-y-1 text-sm">
              <div>
                支持在地址中使用 <code>{'{host}'}</code> 占位符。
              </div>
              <div>当前预览域名：{thirdPartyIconPreviewHost}</div>
            </div>

            <ScrollShadow className="max-h-[420px] pr-2">
              <DndContext
                sensors={thirdPartyIconApiSensors}
                collisionDetection={closestCenter}
                onDragEnd={onThirdPartyIconApiDragEnd}
              >
                <SortableContext items={state.editingThirdPartyIconApis.map((item) => item.id)}>
                  <div className="flex flex-col gap-3">
                    {state.editingThirdPartyIconApis.map((item) => (
                      <SortableThirdPartyIconApiCard
                        key={item.id}
                        item={item}
                        error={state.thirdPartyIconApiErrors[item.id]}
                        previewHost={thirdPartyIconPreviewHost}
                        onChange={updateThirdPartyIconApiConfig}
                        onRemove={removeThirdPartyIconApiConfig}
                        onMountRef={(node) => {
                          thirdPartyIconApiItemRefs.current[item.id] = node
                        }}
                      />
                    ))}

                    {!state.editingThirdPartyIconApis.length && (
                      <div className="text-foreground-500 rounded-xl border border-dashed px-4 py-10 text-center text-sm">
                        暂无 API 配置，请先添加
                      </div>
                    )}
                    <div ref={thirdPartyIconApiListEndRef} />
                  </div>
                </SortableContext>
              </DndContext>
            </ScrollShadow>

            <Button
              variant="flat"
              className="mt-2 w-full"
              startContent={<span className={cn(IconNames.Tabler.PLUS, 'text-sm')} />}
              onClick={addThirdPartyIconApiConfig}
            >
              添加 API
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              className="mr-auto"
              onClick={restoreDefaultThirdPartyIconApiConfigs}
            >
              恢复默认
            </Button>
            <Button variant="light" onClick={closeThirdPartyIconApiConfig}>
              取 消
            </Button>
            <Button color="primary" onClick={saveThirdPartyIconApiConfigs}>
              保 存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

type SortableThirdPartyIconApiCardProps = {
  item: ThirdPartyIconApiConfig
  error?: ThirdPartyIconApiConfigErrors
  previewHost: string
  onChange: (id: ThirdPartyIconApiConfig['id'], key: 'name' | 'srcTemplate', value: string) => void
  onRemove: (id: ThirdPartyIconApiConfig['id']) => void
  onMountRef: (node: HTMLDivElement | null) => void
}

function SortableThirdPartyIconApiCard(props: SortableThirdPartyIconApiCardProps) {
  const { item, error, previewHost, onChange, onRemove, onMountRef } = props
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  })
  const previewSrc = resolveThirdPartyIconApiSrc(item.srcTemplate, previewHost)
  const canPreview = isValidThirdPartyIconApiSrcTemplate(item.srcTemplate)

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        onMountRef(node)
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="rounded-xl border p-3"
    >
      <div className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)_84px]">
        <Input
          size="sm"
          label="名称"
          labelPlacement="outside"
          placeholder="例如：Google"
          isInvalid={!!error?.name}
          errorMessage={error?.name}
          value={item.name}
          onValueChange={(value) => onChange(item.id, 'name', value)}
        />
        <Input
          size="sm"
          label="地址模板"
          labelPlacement="outside"
          placeholder="https://example.com/favicon?url={host}"
          isInvalid={!!error?.srcTemplate}
          errorMessage={error?.srcTemplate}
          value={item.srcTemplate}
          endContent={
            <div className="flex h-6 w-6 items-center justify-center">
              {canPreview ? (
                <Favicon
                  size={20}
                  src={previewSrc}
                  showSpinner
                  className="border"
                  disableLazyLoading
                  showErrorIconOnFailed
                />
              ) : (
                <span className={cn(IconNames.Tabler.ALERT_CIRCLE, 'text-warning text-base')} />
              )}
            </div>
          }
          onValueChange={(value) => onChange(item.id, 'srcTemplate', value)}
        />
        <div className="flex items-center justify-end gap-1 self-start pt-6">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            aria-label="删除 API"
            className="h-8 min-w-8"
            onClick={() => onRemove(item.id)}
          >
            <span className={cn(IconNames.Tabler.TRASH, 'text-lg')} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="拖拽排序"
            className="text-foreground-500 h-8 min-w-8 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <span className={cn(IconNames.Tabler.ARROWS_MOVE_VERTICAL, 'text-base')} />
          </Button>
        </div>
      </div>
    </div>
  )
}
