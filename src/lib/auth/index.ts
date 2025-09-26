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

// ! 首个新用户设为管理员权限
const originCreateUser = adapter.createUser!
adapter.createUser = async (data) => {
  if ((await UserController.count()) === 0) {
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
export async function getAuthedUserId() {
  const session = await auth()
  if (!session) throw new Error('getAuthedUserId() 调用出错')
  return session.user.id!
}
