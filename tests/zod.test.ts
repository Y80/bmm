import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'

i18next.init({
  lng: 'es',
  resources: { es: { zod: translation } },
})
z.setErrorMap(zodI18nMap)

const schema = z.object({
  email: z.string().email(),
})
const res = schema.safeParse({ email: 'xx' })

if (res.error) {
  const errorMessages = res.error.issues.reduce((prev, issue) => (prev += issue.message), '')
  console.log({ errorMessages })
}
