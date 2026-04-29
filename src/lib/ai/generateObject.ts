import { z } from '@/lib/zod'
import { generateText, Output } from 'ai'
import { getOpenAICompatibleModel } from './providers'

type GenerateAiObjectParams<T extends z.ZodType> = {
  schema: T
  schemaName: string
  system?: string
  prompt: string
}

export async function generateAiObject<T extends z.ZodType>(
  params: GenerateAiObjectParams<T>
): Promise<z.output<T>> {
  const { schema, schemaName, system, prompt } = params
  const { output } = await generateText({
    model: await getOpenAICompatibleModel(),
    system,
    prompt,
    output: Output.object({
      schema,
      name: schemaName,
    }),
  })

  return schema.parse(output)
}
