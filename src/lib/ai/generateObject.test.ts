import { generateText } from 'ai'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { z } from '@/lib/zod'
import { generateAiObject } from './generateObject'
import { getOpenAICompatibleModel } from './providers'

vi.mock('ai', () => ({
  Output: {
    object: vi.fn(({ schema, name }: { schema: unknown; name?: string }) => ({
      schema,
      name,
    })),
  },
  generateText: vi.fn(),
}))

vi.mock('./providers', () => ({
  getOpenAICompatibleModel: vi.fn(),
}))

describe('generateAiObject', () => {
  const schema = z.object({
    title: z.string(),
    count: z.number(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getOpenAICompatibleModel).mockResolvedValue({} as never)
  })

  test('uses structured output and returns parsed object', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: {
        title: 'BMM',
        count: 2,
      },
    } as never)

    await expect(
      generateAiObject({
        schema,
        schemaName: 'bookmark_analysis',
        system: 'system prompt',
        prompt: 'user prompt',
      })
    ).resolves.toEqual({
      title: 'BMM',
      count: 2,
    })

    expect(generateText).toHaveBeenCalledTimes(1)
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: {},
        system: 'system prompt',
        prompt: 'user prompt',
        output: expect.objectContaining({
          name: 'bookmark_analysis',
          schema,
        }),
      })
    )
  })

  test('throws schema validation error when output shape is invalid', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: {
        title: 'BMM',
        count: '2',
      },
    } as never)

    await expect(
      generateAiObject({
        schema,
        schemaName: 'bookmark_analysis',
        prompt: 'user prompt',
      })
    ).rejects.toThrowError(/count|number|string/)
  })
})
