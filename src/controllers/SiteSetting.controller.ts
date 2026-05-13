import { db, schema } from '@/db'
import { z } from '@/lib/zod'
import { eq } from 'drizzle-orm'

const CONFIG_KEY = 'site.proxy'

export const siteProxyConfigSchema = z.object({
  proxyUrl: z.string(),
})

type SiteProxyConfig = z.output<typeof siteProxyConfigSchema>

const defaultConfig: SiteProxyConfig = { proxyUrl: '' }

async function getConfig(): Promise<SiteProxyConfig> {
  const row = await db.query.siteConfigs.findFirst({
    where: eq(schema.siteConfigs.key, CONFIG_KEY),
  })
  if (!row) return defaultConfig
  const result = siteProxyConfigSchema.safeParse(row.value)
  return result.success ? result.data : defaultConfig
}

async function saveConfig(input: SiteProxyConfig) {
  const parsed = siteProxyConfigSchema.parse(input)
  const value = parsed as typeof schema.siteConfigs.$inferInsert.value

  await db
    .insert(schema.siteConfigs)
    .values({ key: CONFIG_KEY, value, description: '网络代理配置' })
    .onConflictDoUpdate({
      target: schema.siteConfigs.key,
      set: { value, updatedAt: new Date() },
    })

  return parsed
}

async function getProxyUrl(): Promise<string> {
  const config = await getConfig()
  return config.proxyUrl
}

const SiteSettingController = { getConfig, saveConfig, getProxyUrl }

export default SiteSettingController
