'use client'

import {
  actClearAiProvidersConfig,
  actDuplicateAiProvider,
  actGetAiProvidersConfig,
  actListAiProviderModels,
  actSaveAiProvidersConfig,
  actTestAiProvider,
} from '@/actions'
import AdminPageTitle from '@/components/AdminPageTitle'
import { AdminSurfaceCard } from '@/components/AdminPageShell'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import type { SafeAiProviderConfig, SafeAiProvidersConfig } from '@/controllers'
import { runAction } from '@/utils/client'
import { IconNames, PageRoutes } from '@cfg'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
} from '@heroui/react'
import { useRequest } from 'ahooks'
import { useMemo, useState } from 'react'

type EditableProvider = SafeAiProviderConfig & {
  apiKey?: string
}

type EditableConfig = {
  activeProviderId?: string
  providers: EditableProvider[]
}

type ProviderForm = {
  id?: string
  type: 'openai-compatible'
  name: string
  baseUrl: string
  model: string
  apiKey: string
}

const emptyConfig: EditableConfig = { providers: [] }
const defaultForm: ProviderForm = {
  type: 'openai-compatible',
  name: '',
  baseUrl: '',
  model: '',
  apiKey: '',
}

function createProviderId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `provider-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toEditableConfig(config: SafeAiProvidersConfig): EditableConfig {
  return {
    activeProviderId: config.activeProviderId,
    providers: config.providers.map((provider) => ({ ...provider, apiKey: '' })),
  }
}

function toSavePayload(config: EditableConfig) {
  return {
    activeProviderId: config.activeProviderId,
    providers: config.providers.map(({ hasApiKey, ...provider }) => ({
      ...provider,
      apiKey: provider.apiKey?.trim() || undefined,
    })),
  }
}

function getActiveProvider(config: EditableConfig) {
  return config.providers.find((provider) => provider.id === config.activeProviderId)
}

export default function Page() {
  const [config, setConfig] = useState<EditableConfig>(emptyConfig)
  const [form, setForm] = useState<ProviderForm>(defaultForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [modelNames, setModelNames] = useState<string[]>([])
  const [modelNamesLoading, setModelNamesLoading] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [modelKeyword, setModelKeyword] = useState('')
  const activeProvider = useMemo(() => getActiveProvider(config), [config])
  const filteredModelNames = useMemo(() => {
    const keyword = modelKeyword.trim().toLowerCase()
    if (!keyword) return modelNames
    return modelNames.filter((modelName) => modelName.toLowerCase().includes(keyword))
  }, [modelKeyword, modelNames])

  const { loading, refresh } = useRequest(async () => {
    const res = await runAction(actGetAiProvidersConfig())
    if (res.ok) {
      setConfig(toEditableConfig(res.data))
    }
  })

  function openCreateModal() {
    setEditingId('')
    setForm(defaultForm)
    setModelNames([])
    setModelKeyword('')
    setIsModelDropdownOpen(false)
    setIsModalOpen(true)
  }

  function openEditModal(provider: EditableProvider) {
    setEditingId(provider.id)
    setForm({
      id: provider.id,
      type: provider.type,
      name: provider.name,
      baseUrl: provider.baseUrl,
      model: provider.model,
      apiKey: '',
    })
    setModelNames([])
    setModelKeyword('')
    setIsModelDropdownOpen(false)
    setIsModalOpen(true)
  }

  async function saveConfig(nextConfig: EditableConfig, okMsg = '配置已保存') {
    const res = await runAction(actSaveAiProvidersConfig(toSavePayload(nextConfig)), {
      okMsg,
    })
    if (!res.ok) return false
    setConfig(toEditableConfig(res.data))
    return true
  }

  async function submitForm() {
    const provider: EditableProvider = {
      id: form.id || createProviderId(),
      type: form.type,
      name: form.name.trim(),
      baseUrl: form.baseUrl.trim(),
      model: form.model.trim(),
      apiKey: form.apiKey.trim(),
      hasApiKey: Boolean(form.apiKey.trim()) || Boolean(editingId),
    }
    const providers = editingId
      ? config.providers.map((item) => (item.id === editingId ? provider : item))
      : config.providers.concat(provider)
    const activeProviderId = config.activeProviderId || provider.id
    const ok = await saveConfig({ activeProviderId, providers })
    if (ok) {
      setIsModalOpen(false)
      setForm(defaultForm)
      setEditingId('')
    }
  }

  async function toggleActiveProvider(provider: EditableProvider, isSelected: boolean) {
    await saveConfig(
      { ...config, activeProviderId: isSelected ? provider.id : undefined },
      isSelected ? '已切换启用供应商' : '已关闭启用供应商'
    )
  }

  async function deleteProvider(provider: EditableProvider) {
    const providers = config.providers.filter((item) => item.id !== provider.id)
    const activeProviderId =
      config.activeProviderId === provider.id ? undefined : config.activeProviderId
    await saveConfig({ activeProviderId, providers }, '供应商已删除')
  }

  async function duplicateProvider(provider: EditableProvider) {
    const res = await runAction(actDuplicateAiProvider({ id: provider.id }), {
      okMsg: '供应商已复制',
    })
    if (res.ok) {
      setConfig(toEditableConfig(res.data))
    }
  }

  async function testProvider(provider: EditableProvider) {
    const res = await runAction(actTestAiProvider({ id: provider.id }))
    if (res.ok) {
      addToast({
        color: 'success',
        title: '测试通过',
        description: res.data.message,
      })
    }
  }

  async function fetchModelNames() {
    setModelNamesLoading(true)
    const res = await runAction(
      actListAiProviderModels({
        id: form.id,
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
      }),
      { okMsg: '模型列表已获取' }
    )
    setModelNamesLoading(false)
    if (!res.ok) return

    setModelNames(res.data)
    if (!res.data.length) {
      setIsModelDropdownOpen(false)
      addToast({
        color: 'warning',
        title: '未读取到模型',
        description: '接口返回的模型列表为空',
      })
      return
    }

    setModelKeyword('')
    setIsModelDropdownOpen(true)
  }

  function renderModelLabel() {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-small text-foreground-500">模型名称</span>
        <Button
          size="sm"
          variant="flat"
          className="h-7 px-2 text-xs"
          isLoading={modelNamesLoading}
          onPress={fetchModelNames}
        >
          获取模型列表
        </Button>
      </div>
    )
  }

  function renderModelDropdown() {
    if (!modelNames.length) return null

    return (
      <Dropdown
        placement="bottom-end"
        isOpen={isModelDropdownOpen}
        onOpenChange={setIsModelDropdownOpen}
      >
        <DropdownTrigger>
          <Button
            aria-label="选择模型"
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-7 text-lg"
          >
            <span className={IconNames.Tabler.CHEVRON_DOWN} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="模型列表"
          className="max-h-72 min-w-72 overflow-y-auto"
          emptyContent="没有匹配的模型"
          topContent={
            <div className="mt-1">
              <Input
                aria-label="筛选模型"
                autoFocus
                size="sm"
                placeholder="输入关键词筛选模型"
                value={modelKeyword}
                onValueChange={setModelKeyword}
              />
            </div>
          }
          onAction={(key) => {
            setForm((value) => ({ ...value, model: String(key) }))
            setIsModelDropdownOpen(false)
          }}
        >
          {filteredModelNames.map((modelName) => (
            <DropdownItem key={modelName} textValue={modelName}>
              <span className="font-mono text-xs">{modelName}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )
  }

  async function clearConfig() {
    const res = await runAction(actClearAiProvidersConfig(), { okMsg: '配置已清空' })
    if (res.ok) {
      setConfig(emptyConfig)
      await refresh()
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <AdminPageTitle title="大模型供应商" pathname={PageRoutes.Admin.AI_PROVIDER} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.55fr)]">
        <AdminSurfaceCard bodyClassName="p-5 sm:p-6">
          <div className="min-w-0">
            <div className="text-default-500 text-sm">当前启用</div>
            <div className="mt-2 truncate text-xl font-semibold">
              {activeProvider?.name || '未配置'}
            </div>
          </div>

          <div className="border-divider/70 bg-content2/45 mt-5 rounded-xl border p-4">
            <div className="grid gap-3 text-sm">
              <div>
                <div className="text-default-500">类型</div>
                <div className="mt-1 font-medium">
                  {activeProvider?.type || 'openai-compatible'}
                </div>
              </div>
              <div>
                <div className="text-default-500">API 地址</div>
                <div className="mt-1 font-mono text-xs break-all">
                  {activeProvider?.baseUrl || '-'}
                </div>
              </div>
              <div>
                <div className="text-default-500">模型</div>
                <div className="mt-1 font-mono text-xs">{activeProvider?.model || '-'}</div>
              </div>
            </div>
          </div>

          <div className="border-divider/70 bg-content2/45 mt-4 rounded-xl border p-4">
            <div className="text-default-500 text-sm">数据格式</div>
            <p className="text-default-500 mt-2 text-xs leading-5">
              当前仅支持兼容 OpenAI Chat Completions
              的接口。OpenAI、DeepSeek、Moonshot、通义千问兼容模式和 LM Studio
              本地服务通常都属于这类格式。
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <ReButton
              color="primary"
              startContent={<span className={IconNames.Huge.ADD} />}
              onClick={openCreateModal}
            >
              新增供应商
            </ReButton>
            <ReButton
              variant="flat"
              color="danger"
              isDisabled={!config.providers.length}
              startContent={<span className={IconNames.Tabler.TRASH} />}
              popoverContent={
                <div className="flex max-w-[280px] flex-col gap-4 p-4">
                  <p>确定清空所有供应商配置？</p>
                  <ReButton color="danger" size="sm" variant="shadow" onClick={clearConfig}>
                    确定
                  </ReButton>
                </div>
              }
            >
              清空配置
            </ReButton>
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard bodyClassName="p-4 sm:p-5">
          <Table aria-label="ai provider table" removeWrapper>
            <TableHeader>
              <TableColumn>供应商</TableColumn>
              <TableColumn className="max-sm:hidden">模型</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody<EditableProvider>
              items={loading ? [] : config.providers}
              isLoading={loading}
              loadingContent={<Spinner className="mt-12" label="Loading..." />}
              emptyContent="暂无供应商"
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.name}</div>
                      <div className="text-default-500 max-w-72 truncate font-mono text-xs">
                        {item.baseUrl}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-sm:hidden">
                    <div className="max-w-52 truncate font-mono text-xs">{item.model}</div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      aria-label={`启用供应商 ${item.name}`}
                      size="sm"
                      color="primary"
                      isSelected={config.activeProviderId === item.id}
                      onValueChange={(isSelected) => toggleActiveProvider(item, isSelected)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0">
                      <ReButton
                        aria-label={`编辑供应商 ${item.name}`}
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="text-lg"
                        startContent={<span className={IconNames.Tabler.EDIT} />}
                        onClick={() => openEditModal(item)}
                      />
                      <ReButton
                        aria-label={`复制供应商 ${item.name}`}
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="text-lg"
                        startContent={<span className={IconNames.Tabler.COPY} />}
                        onClick={() => duplicateProvider(item)}
                      />
                      <ReButton
                        aria-label={`测试供应商 ${item.name}`}
                        size="sm"
                        variant="light"
                        isIconOnly
                        className="text-lg"
                        startContent={<span className={IconNames.Tabler.PLUG_CONNECTED} />}
                        onClick={() => testProvider(item)}
                      />
                      <ReButton
                        aria-label={`删除供应商 ${item.name}`}
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        className="text-lg"
                        startContent={<span className={IconNames.Tabler.TRASH} />}
                        popoverContent={
                          <div className="flex max-w-[280px] flex-col gap-4 p-4">
                            <p>确定删除供应商「{item.name}」？</p>
                            <ReButton
                              color="danger"
                              size="sm"
                              variant="shadow"
                              onClick={() => deleteProvider(item)}
                            >
                              确定
                            </ReButton>
                          </div>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AdminSurfaceCard>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} backdrop="blur">
        <ModalContent>
          <ModalHeader>{editingId ? '编辑供应商' : '新增供应商'}</ModalHeader>
          <ModalBody>
            <div className="grid gap-4">
              <ReInput
                label="供应商名称"
                autoComplete="off"
                name="ai-provider-name"
                value={form.name}
                onValueChange={(name) => setForm((value) => ({ ...value, name }))}
              />
              <ReInput
                label="API 地址"
                autoComplete="off"
                description="填写 API 基础地址，例如 https://api.openai.com/v1，无需包含 /chat/completions 路径。"
                name="ai-provider-base-url"
                value={form.baseUrl}
                onValueChange={(baseUrl) => setForm((value) => ({ ...value, baseUrl }))}
              />
              <ReInput
                label="API Key"
                autoComplete="new-password"
                name="ai-provider-api-key"
                type="password"
                value={form.apiKey}
                placeholder={editingId ? '留空则不修改' : ' '}
                onValueChange={(apiKey) => setForm((value) => ({ ...value, apiKey }))}
              />
              <div className="grid gap-2">
                {renderModelLabel()}
                <ReInput
                  aria-label="模型名称"
                  autoComplete="off"
                  name="ai-provider-model"
                  endContent={renderModelDropdown()}
                  value={form.model}
                  onValueChange={(model) => setForm((value) => ({ ...value, model }))}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              取消
            </Button>
            <ReButton color="primary" onClick={submitForm}>
              保存
            </ReButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
