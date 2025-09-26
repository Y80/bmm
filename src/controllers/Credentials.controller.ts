import { db, schema } from '@/db'
import { z, zodSchemas } from '@/lib/zod'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import UserController from './User.controller'

// 使用 pbkdf2 算法生成哈希，1000 轮迭代，32 字节长度的密钥
function pbkdf2Has(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex')
}

/**
 * 为密码生成 salt 并进行哈希处理
 * @param password 原始密码
 * @returns 包含哈希密码和 salt 的对象
 */
function saltAndHashPassword(password: string) {
  // 生成随机 salt
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = pbkdf2Has(password, salt)
  return { hash, salt }
}

/** 验证密码是否匹配 */
function verifyPassword(password: string, hash: string, salt: string) {
  return pbkdf2Has(password, salt) === hash
}

const CredentialsController = {
  // 注册时，创建账户
  async create(payload: z.infer<typeof zodSchemas.userCredential>) {
    const { email, password } = zodSchemas.userCredential.parse(payload)
    const count = await db.$count(schema.users, eq(schema.users.email, email))
    if (count > 0) throw new Error('邮箱已被注册使用')
    const { hash, salt } = saltAndHashPassword(password)
    const [user] = await db
      .insert(schema.users)
      .values({
        email: email,
        name: email.split('@').shift(),
        // ! 首个新用户设为管理员权限
        role: (await UserController.count()) === 0 ? 'admin' : 'user',
      })
      .returning()
    await Promise.all([
      db.insert(schema.credentials).values({
        userId: user.id,
        password: hash,
        salt,
      }),
      db.insert(schema.accounts).values({
        userId: user.id,
        type: 'email',
        provider: 'credentials',
        providerAccountId: email,
      }),
    ])
  },
  // 登录时，验证账户
  async verify(payload: z.infer<typeof zodSchemas.userCredential>) {
    const { email } = zodSchemas.userCredential.parse(payload)
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: { credential: true },
    })
    if (!user || !user.credential) {
      throw new Error('邮箱或密码错误，请检查。')
    }
    const { password: hash, salt } = user.credential
    if (!verifyPassword(payload.password, hash, salt)) {
      throw new Error('邮箱或密码错误，请检查。')
    }
    return user
  },
  // 删除账户
  async delete(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    })
    if (!user) {
      throw new Error('用户不存在')
    }
    await db.delete(schema.users).where(eq(schema.users.id, user.id))
  },
}

export default CredentialsController
