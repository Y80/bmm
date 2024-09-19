import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import PublicTagController from '@/controllers/PublicTag.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { zodSchema } from '@/db/zod'
import { z } from '@/lib/zod'
import { createQueryObject } from '@/utils'
import ResponseX from '@/utils/response-x'
import { NextRequest } from 'next/server'
import { fromZodError } from 'zod-validation-error'

export module PublicBookmarkHandler {
  export async function insert(req: Request) {
    await PublicBookmarkController.insert(await req.json())
  }

  export async function find(req: Request) {
    const body = createQueryObject(req.url)
    const validateRes = z.object({ id: z.string().transform((v) => Number(v)) }).safeParse(body)
    if (!validateRes.success) return ResponseX.badRequest()
    return await PublicBookmarkController.query(validateRes.data)
  }

  export async function findMany(req: NextRequest) {
    return await PublicBookmarkController.findMany(
      findManyBookmarksSchema.parse(createQueryObject(req.url))
    )
  }

  export async function remove(req: Request) {
    const body = await req.json()
    const validateRes = zodSchema.publicBookmarks.delete().safeParse(body)
    if (!validateRes.success) return ResponseX.badRequest()
    await PublicBookmarkController.delete(validateRes.data)
  }

  export async function update(req: Request) {
    const body = await req.json()
    const validateRes = zodSchema.publicBookmarks.update().safeParse(body)
    if (!validateRes.success)
      return ResponseX.badRequest(fromZodError(validateRes.error).toString())
    await PublicBookmarkController.update(validateRes.data)
  }
}

export module PublicTagHandler {
  export async function getAll() {
    return await PublicTagController.getAll()
  }

  export async function insert(req: Request) {
    const body = await req.json()
    const vldRes = zodSchema.publicTags.insert().safeParse(body)
    if (!vldRes.success) return ResponseX.badRequest()
    await PublicTagController.insert(vldRes.data)
  }

  export async function update(req: Request) {
    const body = await req.json()
    const vldRes = zodSchema.publicTags.update().safeParse(body)
    if (!vldRes.success) return ResponseX.badRequest({ msg: fromZodError(vldRes.error).toString() })
    await PublicTagController.update(vldRes.data)
  }

  export async function remove(req: Request) {
    const body = await req.json()
    const vldRes = zodSchema.publicTags.delete().safeParse(body)
    if (!vldRes.success) return ResponseX.badRequest()
    await PublicTagController.remove(vldRes.data)
  }
}
