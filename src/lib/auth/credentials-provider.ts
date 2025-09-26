import CredentialsController from '@/controllers/Credentials.controller'
import { to } from '@/utils'
import { pick } from 'lodash'
import CredentialsProvider from 'next-auth/providers/credentials'
import { zodSchemas } from '../zod'

export const credentialsProvider = CredentialsProvider({
  credentials: {
    email: { label: '邮箱', type: 'email' },
    password: { label: '密码', type: 'password' },
  },
  async authorize(credentials) {
    const result = zodSchemas.userCredential.safeParse(credentials)
    if (!result.success) return null
    const [err, user] = await to(CredentialsController.verify(result.data))
    if (err) return null
    return {
      ...pick(user, ['id', 'name', 'email']),
      role: user.role!,
      isAdmin: user.role === 'admin',
    }
  },
})
