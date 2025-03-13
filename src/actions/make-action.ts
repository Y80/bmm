import { auth } from '@/lib/auth'
import SqlXError from '@/lib/SqlXError'
import { to } from '@/utils'
import { PageRoutes } from '@cfg'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z, ZodSchema } from 'zod'

interface MakeActionOptions {
  /**
   * 接口守卫
   * - false: 不需要登录
   * - 'decide-by-referer': 由 referer 决定是否需要登录
   * - 'user': 需要登录
   * - 'admin': 需要管理员权限
   * @default 'user'
   */
  guard?: false | 'user' | 'admin' | 'decide-by-referer'
  schema?: ZodSchema
}
export function makeAction<Data, Arg>(
  handler: (...args: Arg[]) => Promise<Data>,
  opts?: MakeActionOptions
) {
  opts = {
    guard: 'user',
    ...opts,
  }
  // type NewPayload = typeof opts.schema extends ZodSchema ? z.infer<typeof opts.schema> : Payload
  type NewArgs = typeof opts.schema extends ZodSchema ? [z.infer<typeof opts.schema>] : Arg[]
  return async (...args: NewArgs) => {
    type ErrorResult = { readonly error: { msg: string } }
    // type SuccessResult = { readonly error?: undefined; readonly data: Data }
    let payload = args[0]
    if (opts.schema) {
      const result = opts.schema.safeParse(payload)
      if (!result.success) {
        return {
          error: { msg: '参数错误：' + result.error.issues.pop()?.message || '未知的参数错误' },
        } as ErrorResult
      }
      payload = result.data
    }

    if (opts.guard) {
      const session = await auth()
      // console.log('auth() 返回的 session:\n', session)
      if (!session) {
        redirect(PageRoutes.LOGIN)
      }
      let checkIsAdmin = false
      if (opts.guard === 'decide-by-referer') {
        const referer = headers().get('referer')
        if (!referer) return { error: { msg: '无效请求' } } as ErrorResult
        checkIsAdmin = PageRoutes.Admin.space(referer)
      } else if (opts.guard === 'admin') {
        checkIsAdmin = true
      }
      console.log({ checkIsAdmin })
      if (checkIsAdmin && !session.user.isAdmin) {
        redirect(PageRoutes.LOGIN)
      }
    }

    const [error, data] = await to(handler(payload))
    if (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
      return { error: { msg: getErrorMsg(error) } } as ErrorResult
    }
    return { data, error: undefined } as const
  }
}
export type ActionResult<T> = ReturnType<ReturnType<typeof makeAction<T, object>>>

function getErrorMsg(error: unknown) {
  if (SqlXError.canParse(error)) {
    return SqlXError.getMessage(error)
  }
  if (error instanceof Error) {
    return error.message
  }
  return '未知错误'
}
