import { z } from '.'

export const zodSchemas = {
  userCredential: z.object({
    email: z.email('请输入有效的邮箱地址'),
    password: z
      .string()
      .nonempty('密码不可为空')
      .min(6, '密码长度不能少于 6 位')
      .max(32, '密码长度不能超过 32 位'),
  }),
}
