import { analyzeWebsite } from '@/lib/ai'
import { z } from '@/lib/zod'

export async function handleAnalyzeWebsite(req: Request) {
  const schema = z.object({
    url: z.string().url(),
  })
  const res = schema.parse(await req.json())
  return await analyzeWebsite(res.url)
}
