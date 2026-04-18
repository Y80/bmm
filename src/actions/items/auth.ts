import UserController from '@/controllers/User.controller'
import { auth } from '@/lib/auth'
import { z, zodSchemas } from '@/lib/zod'
import { robustUrl } from '@/utils'
import { makeActionInput } from '../make-action'

export async function checkGithubOAuthConfig() {
  return !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)
}

const deleteUserSchema = z.object({
  id: z.string(),
})

async function updateUserProfile(payload: unknown) {
  const session = await auth()
  if (!session?.user.id) {
    throw new Error('请先登录')
  }

  const { name, image } = zodSchemas.userProfileUpdate.parse(payload)
  const normalizedImage = image ? robustUrl(image) : null

  return await UserController.updateProfile(session.user.id, {
    name,
    image: normalizedImage || null,
  })
}

async function deleteUser(payload: unknown) {
  const session = await auth()
  if (!session?.user.id) {
    throw new Error('请先登录')
  }

  const { id } = deleteUserSchema.parse(payload)
  if (session.user.id === id) {
    throw new Error('不能删除当前登录用户')
  }

  return await UserController.delete(id)
}

export const updateUserProfileInput = makeActionInput({
  handler: updateUserProfile,
  schema: zodSchemas.userProfileUpdate,
  guard: 'user',
  name: 'updateUserProfile',
})

export const deleteUserInput = makeActionInput({
  handler: deleteUser,
  schema: deleteUserSchema,
  guard: 'admin',
  name: 'deleteUser',
})
