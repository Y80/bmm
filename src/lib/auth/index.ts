import UserController from '@/controllers/User.controller'
import { db, schema } from '@/db'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth, { NextAuthConfig } from 'next-auth'
import { authConfig } from './config'

const adapter = DrizzleAdapter(db, {
  usersTable: schema.users,
  accountsTable: schema.accounts,
  sessionsTable: schema.sessions,
  verificationTokensTable: schema.verificationTokens,
  authenticatorsTable: schema.authenticators,
})
const originCreateUser = adapter.createUser!
adapter.createUser = async (data) => {
  if (
    (process.env.AUTO_GRANT_ADMIN === '1' && (await UserController.count()) === 0) ||
    (process.env.AUTO_GRANT_ADMIN === data.name && data.name)
  ) {
    data.role = 'admin'
  }
  return originCreateUser(data)
}

const nextAuthOptions: NextAuthConfig = {
  ...authConfig,
  adapter,
}

export const nextAuthLib = NextAuth(nextAuthOptions)

export const auth = nextAuthLib.auth

/**
 * 获取用户 ID
 *
 * ! 仅在已登录的情况下可用，如果未登录则抛出错误
 */
export async function getUserId() {
  const session = await auth()
  if (!session) throw new Error('getUserId() 调用出错')
  return session.user.id!
}
