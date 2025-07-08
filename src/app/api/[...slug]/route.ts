import { auth } from '@/lib/auth'
import { Method } from '@/lib/http'
import SqlXError from '@/lib/SqlXError'
import ResponseX, { Serializable } from '@/utils/response-x'
import { ApiRoutes } from '@cfg'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { handleAnalyzeRelatedTags } from './handlers/ai/analyze-related-tags'
import { handleAnalyzeWebsite } from './handlers/ai/analyze-website'
import { handleParseWebsite } from './handlers/parse-website'
import { PublicBookmarkHandler, PublicTagHandler } from './handlers/public'

// GET POST Patch Delete 请求统一由 handlerWrap() 处理，具体请求分发由 handler() 处理
export {
  handlerWrapper as DELETE,
  handlerWrapper as GET,
  handlerWrapper as PATCH,
  handlerWrapper as POST,
}

async function handlerWrapper(req: NextRequest) {
  try {
    const res = await handler(req)
    if (res instanceof Response) return res
    else if (!res) return ResponseX.noContent()
    else return ResponseX.ok(res as Serializable)
  } catch (error: any) {
    if (SqlXError.canParse(error)) {
      return ResponseX.internalServerError({ msg: SqlXError.getMessage(error) })
    }
    if (error instanceof ZodError) {
      return ResponseX.badRequest({ msg: fromZodError(error).toString() })
    }
    return ResponseX.internalServerError({ msg: (error as Error)?.message || '未知错误' })
  }
}

async function handler(req: NextRequest) {
  const { method } = req
  const { pathname } = req.nextUrl
  const session = await auth()
  if (!session) {
    return ResponseX.unauthorized({ msg: '请先登录' })
  }

  const isAdmin = session?.user.role === 'admin'

  if (pathname === ApiRoutes.Public.TAG) {
    if (method === Method.GET) return PublicTagHandler.getAll()
    if (isAdmin) {
      if (method === Method.POST) return PublicTagHandler.insert(req)
      if (method === Method.PATCH) return PublicTagHandler.update(req)
      if (method === Method.DELETE) return PublicTagHandler.remove(req)
    } else {
      return ResponseX.forbidden({ msg: '需要管理员权限' })
    }
  } else if (pathname === ApiRoutes.Public.BOOKMARK) {
    if (method === Method.GET) return PublicBookmarkHandler.find(req)
    if (isAdmin) {
      if (method === Method.POST) return PublicBookmarkHandler.insert(req)
      if (method === Method.PATCH) return PublicBookmarkHandler.update(req)
      if (method === Method.DELETE) return PublicBookmarkHandler.remove(req)
    } else {
      return ResponseX.forbidden({ msg: '需要管理员权限' })
    }
  } else if (pathname === ApiRoutes.Public.BOOKMARK_LIST) {
    if (method === Method.GET) return PublicBookmarkHandler.findMany(req)
  } else if (pathname === ApiRoutes.PARSE_WEBSITE) {
    if (method === Method.POST) return handleParseWebsite(req)
  } else if (pathname === ApiRoutes.Ai.ANALYZE_WEBSITE) {
    if (method === Method.POST) return handleAnalyzeWebsite(req)
  } else if (pathname === ApiRoutes.Ai.ANALYZE_RELATED_TAGS) {
    if (method === Method.POST) return handleAnalyzeRelatedTags(req)
  }

  return ResponseX.notFound({ msg: '未实现的 API 请求' })
}
