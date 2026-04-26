import { db, schema } from '@/db'
import { z } from '@/lib/zod'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

const SITE_AI_PROVIDERS_CONFIG_KEY = 'ai.providers'

export const aiProviderSchema = z.object({
  id: z.string().trim().optional(),
  type: z.literal('openai-compatible'),
  name: z.string().trim().min(1, '请输入供应商名称'),
  baseUrl: z.url('请输入有效的 API 地址'),
  model: z.string().trim().min(1, '请输入模型名称'),
  apiKey: z.string().optional(),
})

export const aiProvidersConfigSchema = z
  .object({
    activeProviderId: z.string().trim().optional(),
    providers: z.array(aiProviderSchema),
  })
  .superRefine((value, ctx) => {
    const ids = value.providers.map((provider) => provider.id).filter(Boolean)
    const names = value.providers.map((provider) => provider.name)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: 'custom',
        message: '供应商 ID 不可重复',
        path: ['providers'],
      })
    }
    if (new Set(names).size !== names.length) {
      ctx.addIssue({
        code: 'custom',
        message: '供应商名称不可重复',
        path: ['providers'],
      })
    }
    if (value.providers.length > 0 && !value.activeProviderId) {
      ctx.addIssue({
        code: 'custom',
        message: '请选择一个启用的供应商',
        path: ['activeProviderId'],
      })
    }
    if (
      value.activeProviderId &&
      !value.providers.some((provider) => provider.id === value.activeProviderId)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: '启用的供应商不存在',
        path: ['activeProviderId'],
      })
    }
  })

export const duplicateAiProviderSchema = z.object({
  id: z.string().trim().min(1, '请选择要复制的供应商'),
})

export const testAiProviderSchema = z.object({
  id: z.string().trim().min(1, '请选择要测试的供应商'),
})

export const listAiProviderModelsSchema = z.object({
  id: z.string().trim().optional(),
  baseUrl: z.url('请输入有效的 API 地址'),
  apiKey: z.string().optional(),
})

export type AiProviderInput = z.input<typeof aiProviderSchema>
export type AiProvidersConfigInput = z.input<typeof aiProvidersConfigSchema>
export type AiProviderConfig = z.output<typeof aiProviderSchema> & {
  id: string
  apiKey: string
}
export type AiProvidersConfig = {
  activeProviderId?: string
  providers: AiProviderConfig[]
}
export type SafeAiProviderConfig = Omit<AiProviderConfig, 'apiKey'> & {
  hasApiKey: boolean
}
export type SafeAiProvidersConfig = {
  activeProviderId?: string
  providers: SafeAiProviderConfig[]
}
export type AiProviderTestResult = {
  ok: true
  message: string
}

const AI_PROVIDER_TEST_TIMEOUT = 15 * 1000

function getEmptyConfig(): AiProvidersConfig {
  return { providers: [] }
}

function toSafeConfig(config: AiProvidersConfig): SafeAiProvidersConfig {
  return {
    activeProviderId: config.activeProviderId,
    providers: config.providers.map(({ apiKey, ...provider }) => ({
      ...provider,
      hasApiKey: Boolean(apiKey),
    })),
  }
}

function parseStoredConfig(value: unknown): AiProvidersConfig {
  if (!value) return getEmptyConfig()
  const result = aiProvidersConfigSchema.safeParse(value)
  if (!result.success) return getEmptyConfig()

  return {
    activeProviderId: result.data.activeProviderId,
    providers: result.data.providers
      .filter((provider) => provider.id && provider.apiKey)
      .map((provider) => ({
        ...provider,
        id: provider.id!,
        apiKey: provider.apiKey!,
      })),
  }
}

async function getRawConfig() {
  const row = await db.query.siteConfigs.findFirst({
    where: eq(schema.siteConfigs.key, SITE_AI_PROVIDERS_CONFIG_KEY),
  })
  return parseStoredConfig(row?.value)
}

function mergeConfig(
  input: AiProvidersConfigInput,
  existing: AiProvidersConfig
): AiProvidersConfig {
  const parsed = aiProvidersConfigSchema.parse(input)
  const existingApiKeyMap = new Map(
    existing.providers.map((provider) => [provider.id, provider.apiKey] as const)
  )
  const providers = parsed.providers.map((provider) => {
    const id = provider.id || nanoid()
    const apiKey = provider.apiKey?.trim() || existingApiKeyMap.get(id)
    if (!apiKey) {
      throw new Error(`请为供应商「${provider.name}」配置 API Key`)
    }
    return {
      ...provider,
      id,
      apiKey,
    }
  })

  return {
    activeProviderId: parsed.activeProviderId,
    providers,
  }
}

function createCopiedProviderName(name: string, providers: AiProviderConfig[]) {
  const baseName = `${name} 副本`
  if (!providers.some((provider) => provider.name === baseName)) return baseName

  let index = 2
  while (providers.some((provider) => provider.name === `${baseName} ${index}`)) {
    index += 1
  }
  return `${baseName} ${index}`
}

function getChatCompletionsUrl(baseUrl: string) {
  const url = new URL(baseUrl)
  const pathname = url.pathname.replace(/\/+$/, '')
  if (pathname.endsWith('/chat/completions')) return url.toString()

  url.pathname = `${pathname}/chat/completions`
  return url.toString()
}

function getModelsUrl(baseUrl: string) {
  const url = new URL(baseUrl)
  const pathname = url.pathname.replace(/\/+$/, '')
  if (pathname.endsWith('/models')) return url.toString()

  url.pathname = `${pathname}/models`
  return url.toString()
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name)
}

function getTestProvider(config: AiProvidersConfig, id: string) {
  const provider = config.providers.find((item) => item.id === id)
  if (!provider) {
    throw new Error('要测试的大模型供应商不存在')
  }
  if (!provider.apiKey) {
    throw new Error(`要测试的大模型供应商「${provider.name}」缺少 API Key`)
  }
  return provider
}

function getApiKeyFromInputOrStored(
  config: AiProvidersConfig,
  input: z.output<typeof listAiProviderModelsSchema>
) {
  const apiKey = input.apiKey?.trim()
  if (apiKey) return apiKey

  if (!input.id) return ''
  return config.providers.find((provider) => provider.id === input.id)?.apiKey || ''
}

async function testOpenAICompatibleProvider(
  provider: AiProviderConfig
): Promise<AiProviderTestResult> {
  const response = await fetch(getChatCompletionsUrl(provider.baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 8,
      temperature: 0,
    }),
    signal: AbortSignal.timeout(AI_PROVIDER_TEST_TIMEOUT),
  }).catch((error: unknown) => {
    if (isTimeoutError(error)) {
      throw new Error(`API 请求超时：${AI_PROVIDER_TEST_TIMEOUT / 1000} 秒内没有收到响应`)
    }
    throw new Error(
      `API 发送失败：${error instanceof Error && error.message ? error.message : '无法发送请求'}`
    )
  })

  if (!response.ok) {
    throw new Error(`API 发送失败：接口返回 HTTP ${response.status} ${response.statusText}`.trim())
  }

  const data: unknown = await response.json().catch(() => {
    throw new Error('API 响应的数据格式有问题：返回内容不是合法 JSON')
  })
  const result = z
    .object({
      choices: z.array(
        z.object({
          message: z.object({
            content: z.string(),
          }),
        })
      ),
    })
    .safeParse(data)

  if (!result.success || result.data.choices.length === 0) {
    throw new Error(
      'API 响应的数据格式有问题：没有读取到 choices[0].message.content'
    )
  }

  return { ok: true, message: 'API 联通正常，响应格式符合当前配置' }
}

async function listOpenAICompatibleModels(params: { baseUrl: string; apiKey: string }) {
  const response = await fetch(getModelsUrl(params.baseUrl), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(AI_PROVIDER_TEST_TIMEOUT),
  }).catch((error: unknown) => {
    if (isTimeoutError(error)) {
      throw new Error(`模型列表请求超时：${AI_PROVIDER_TEST_TIMEOUT / 1000} 秒内没有收到响应`)
    }
    throw new Error(
      `模型列表请求发送失败：${error instanceof Error && error.message ? error.message : '无法发送请求'}`
    )
  })

  if (!response.ok) {
    throw new Error(`模型列表请求失败：接口返回 HTTP ${response.status} ${response.statusText}`.trim())
  }

  const data: unknown = await response.json().catch(() => {
    throw new Error('模型列表响应的数据格式有问题：返回内容不是合法 JSON')
  })
  const result = z
    .object({
      data: z.array(
        z.object({
          id: z.string().trim().min(1),
        })
      ),
    })
    .safeParse(data)

  if (!result.success) {
    throw new Error('模型列表响应的数据格式有问题：没有读取到 data[].id')
  }

  return Array.from(new Set(result.data.data.map((item) => item.id))).sort((a, b) =>
    a.localeCompare(b)
  )
}

const AiProviderController = {
  async getConfig() {
    return toSafeConfig(await getRawConfig())
  },

  async getActiveProvider() {
    const config = await getRawConfig()
    if (!config.providers.length) {
      throw new Error('请先在管理员后台配置大模型供应商')
    }
    if (!config.activeProviderId) {
      throw new Error('请先在管理员后台启用一个大模型供应商')
    }
    const provider = config.providers.find((item) => item.id === config.activeProviderId)
    if (!provider) {
      throw new Error('当前启用的大模型供应商不存在')
    }
    if (!provider.apiKey) {
      throw new Error(`当前启用的大模型供应商「${provider.name}」缺少 API Key`)
    }
    return provider
  },

  async duplicateProvider(input: z.input<typeof duplicateAiProviderSchema>) {
    const { id } = duplicateAiProviderSchema.parse(input)
    const config = await getRawConfig()
    const provider = config.providers.find((item) => item.id === id)
    if (!provider) {
      throw new Error('要复制的大模型供应商不存在')
    }

    const nextProvider = {
      ...provider,
      id: nanoid(),
      name: createCopiedProviderName(provider.name, config.providers),
    }
    const nextConfig = {
      ...config,
      providers: config.providers.concat(nextProvider),
    }
    const value = nextConfig as typeof schema.siteConfigs.$inferInsert.value

    await db
      .update(schema.siteConfigs)
      .set({
        value,
        updatedAt: new Date(),
      })
      .where(eq(schema.siteConfigs.key, SITE_AI_PROVIDERS_CONFIG_KEY))

    return toSafeConfig(nextConfig)
  },

  async testProvider(input: z.input<typeof testAiProviderSchema>) {
    const { id } = testAiProviderSchema.parse(input)
    const provider = getTestProvider(await getRawConfig(), id)
    return await testOpenAICompatibleProvider(provider)
  },

  async listModels(input: z.input<typeof listAiProviderModelsSchema>) {
    const parsed = listAiProviderModelsSchema.parse(input)
    const apiKey = getApiKeyFromInputOrStored(await getRawConfig(), parsed)
    if (!apiKey) {
      throw new Error('请先填写 API Key 再获取模型列表')
    }

    return await listOpenAICompatibleModels({
      baseUrl: parsed.baseUrl,
      apiKey,
    })
  },

  async saveConfig(input: AiProvidersConfigInput) {
    const config = mergeConfig(input, await getRawConfig())
    const value = config as typeof schema.siteConfigs.$inferInsert.value

    await db
      .insert(schema.siteConfigs)
      .values({
        key: SITE_AI_PROVIDERS_CONFIG_KEY,
        value,
        description: '大模型供应商配置',
      })
      .onConflictDoUpdate({
        target: schema.siteConfigs.key,
        set: {
          value,
          version: 1,
          updatedAt: new Date(),
        },
      })

    return toSafeConfig(config)
  },

  async clearConfig() {
    await db
      .delete(schema.siteConfigs)
      .where(eq(schema.siteConfigs.key, SITE_AI_PROVIDERS_CONFIG_KEY))
    return getEmptyConfig()
  },
}

export default AiProviderController
