import { db, schema } from '@/db'
import AiProviderController from '@/controllers/AiProvider.controller'
import { eq } from 'drizzle-orm'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

const configKey = 'ai.providers'
let originalConfig: typeof schema.siteConfigs.$inferSelect | undefined

describe('ai providers config', () => {
  beforeAll(async () => {
    originalConfig = await db.query.siteConfigs.findFirst({
      where: eq(schema.siteConfigs.key, configKey),
    })
    await db.delete(schema.siteConfigs).where(eq(schema.siteConfigs.key, configKey))
  })

  afterAll(async () => {
    await db.delete(schema.siteConfigs).where(eq(schema.siteConfigs.key, configKey))
    if (originalConfig) {
      await db.insert(schema.siteConfigs).values({
        key: originalConfig.key,
        value: originalConfig.value,
        version: originalConfig.version,
        description: originalConfig.description,
        createdAt: originalConfig.createdAt,
        updatedAt: originalConfig.updatedAt,
      })
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('未配置供应商时提示先配置后台供应商', async () => {
    await expect(AiProviderController.getActiveProvider()).rejects.toThrowError(
      '请先在管理员后台配置大模型供应商'
    )
  })

  test('保存一组供应商并只返回安全配置', async () => {
    const config = await AiProviderController.saveConfig({
      activeProviderId: 'openai',
      providers: [
        {
          id: 'openai',
          type: 'openai-compatible',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4.1-mini',
          apiKey: 'sk-openai',
        },
        {
          id: 'deepseek',
          type: 'openai-compatible',
          name: 'DeepSeek',
          baseUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat',
          apiKey: 'sk-deepseek',
        },
      ],
    })

    expect(config.activeProviderId).toBe('openai')
    expect(config.providers).toHaveLength(2)
    expect(config.providers[0]).toMatchObject({
      id: 'openai',
      name: 'OpenAI',
      hasApiKey: true,
    })
    expect(config.providers[0]).not.toHaveProperty('apiKey')
  })

  test('切换启用供应商时保留已有 API Key', async () => {
    const config = await AiProviderController.getConfig()

    await AiProviderController.saveConfig({
      activeProviderId: 'deepseek',
      providers: config.providers,
    })

    const row = await db.query.siteConfigs.findFirst({
      where: eq(schema.siteConfigs.key, configKey),
    })
    const value = row?.value as {
      activeProviderId: string
      providers: { id: string; apiKey: string }[]
    }

    expect(value.activeProviderId).toBe('deepseek')
    expect(value.providers.find((provider) => provider.id === 'openai')?.apiKey).toBe('sk-openai')
    expect(value.providers.find((provider) => provider.id === 'deepseek')?.apiKey).toBe(
      'sk-deepseek'
    )

    await expect(AiProviderController.getActiveProvider()).resolves.toMatchObject({
      id: 'deepseek',
      name: 'DeepSeek',
      apiKey: 'sk-deepseek',
    })
  })

  test('复制供应商时保留 API Key 并生成副本名称', async () => {
    const config = await AiProviderController.duplicateProvider({ id: 'deepseek' })
    const copiedProvider = config.providers.find((provider) => provider.name === 'DeepSeek 副本')

    expect(copiedProvider).toMatchObject({
      type: 'openai-compatible',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      hasApiKey: true,
    })

    const row = await db.query.siteConfigs.findFirst({
      where: eq(schema.siteConfigs.key, configKey),
    })
    const value = row?.value as {
      providers: { id: string; name: string; apiKey: string }[]
    }
    const storedCopiedProvider = value.providers.find(
      (provider) => provider.id === copiedProvider?.id
    )
    expect(storedCopiedProvider?.apiKey).toBe('sk-deepseek')
  })

  test('测试供应商联通成功时发送 Chat Completions 请求', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      expect(input).toBe('https://api.deepseek.com/v1/chat/completions')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer sk-deepseek',
        'Content-Type': 'application/json',
      })
      expect(JSON.parse(String(init?.body))).toMatchObject({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'ping' }],
      })

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'pong' } }],
        }),
        { status: 200 }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(AiProviderController.testProvider({ id: 'deepseek' })).resolves.toEqual({
      ok: true,
      message: 'API 联通正常，响应格式符合当前配置',
    })
  })

  test('测试供应商时区分 API 发送失败', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        throw new Error('connect failed')
      })
    )

    await expect(AiProviderController.testProvider({ id: 'deepseek' })).rejects.toThrowError(
      'API 发送失败：connect failed'
    )
  })

  test('测试供应商时区分 API 请求超时', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        const error = new Error('timeout')
        error.name = 'TimeoutError'
        throw error
      })
    )

    await expect(AiProviderController.testProvider({ id: 'deepseek' })).rejects.toThrowError(
      'API 请求超时：15 秒内没有收到响应'
    )
  })

  test('测试供应商时区分 API 响应数据格式问题', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        return new Response(JSON.stringify({ message: 'ok' }), { status: 200 })
      })
    )

    await expect(AiProviderController.testProvider({ id: 'deepseek' })).rejects.toThrowError(
      'API 响应的数据格式有问题：没有读取到 choices[0].message.content'
    )
  })

  test('获取模型列表时发送 OpenAI-compatible models 请求', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      expect(input).toBe('https://api.deepseek.com/v1/models')
      expect(init?.method).toBe('GET')
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer sk-deepseek',
        'Content-Type': 'application/json',
      })

      return new Response(
        JSON.stringify({
          data: [{ id: 'qwen-plus' }, { id: 'deepseek-chat' }, { id: 'qwen-plus' }],
        }),
        { status: 200 }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      AiProviderController.listModels({
        id: 'deepseek',
        baseUrl: 'https://api.deepseek.com/v1',
      })
    ).resolves.toEqual(['deepseek-chat', 'qwen-plus'])
  })

  test('获取模型列表时可以使用新填写的 API Key', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      expect(input).toBe('https://api.openai.com/v1/models')
      expect(init?.headers).toMatchObject({
        Authorization: 'Bearer sk-new',
      })

      return new Response(JSON.stringify({ data: [{ id: 'gpt-4.1-mini' }] }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      AiProviderController.listModels({
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-new',
      })
    ).resolves.toEqual(['gpt-4.1-mini'])
  })

  test('获取模型列表时要求 API Key', async () => {
    await expect(
      AiProviderController.listModels({
        baseUrl: 'https://api.openai.com/v1',
      })
    ).rejects.toThrowError('请先填写 API Key 再获取模型列表')
  })

  test('获取模型列表时区分响应数据格式问题', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => {
        return new Response(JSON.stringify({ object: 'list' }), { status: 200 })
      })
    )

    await expect(
      AiProviderController.listModels({
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk-deepseek',
      })
    ).rejects.toThrowError('模型列表响应的数据格式有问题：没有读取到 data[].id')
  })

  test('启用的供应商必须存在', async () => {
    await expect(
      AiProviderController.saveConfig({
        activeProviderId: 'missing',
        providers: [
          {
            id: 'openai',
            type: 'openai-compatible',
            name: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4.1-mini',
            apiKey: 'sk-openai',
          },
        ],
      })
    ).rejects.toThrowError()
  })
})
