import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'

i18next.init({
  lng: 'zh-CN',
  resources: { 'zh-CN': { zod: translation } },
})
z.setErrorMap(zodI18nMap)

export { z }

export const zodSchemas = {
  userCredential: z.object({
    email: z.string().nonempty('邮箱不可为空').email('请输入有效的邮箱地址'),
    password: z
      .string()
      .nonempty('密码不可为空')
      .min(6, '密码长度不能少于 6 位')
      .max(32, '密码长度不能超过 32 位'),
  }),
}
