import UserController from '@/controllers/User.controller'
import { auth } from '@/lib/auth'
import { zodSchemas } from '@/lib/zod'
import { robustUrl } from '@/utils'
import { makeActionInput } from '../make-action'

export async function checkGithubOAuthConfig() {
  return !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)
}

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

export const updateUserProfileInput = makeActionInput({
  handler: updateUserProfile,
  schema: zodSchemas.userProfileUpdate,
  guard: 'user',
  name: 'updateUserProfile',
})
