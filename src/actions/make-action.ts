import { auth } from '@/lib/auth'
import SqlXError from '@/lib/SqlXError'
import { to } from '@/utils'
import { PageRoutes } from '@cfg'
import { omit } from 'lodash'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z, ZodSchema } from 'zod'

interface MakeActionOptions {
  /**
   * 接口守卫
   * - false: 不需要登录
   * - 'decide-by-referer': 由 referer 决定验证 'user' 还是 'admin'
   * - 'user': 需要登录
   * - 'admin': 需要管理员权限
   * @default 'user'
   */
  guard?: false | 'user' | 'admin' | 'decide-by-referer'
  schema?: ZodSchema
}
export interface MakeActionInput<Arg, Data> extends MakeActionOptions {
  handler: (...args: Arg[]) => Promise<Data>
}
type MakeActionArgs<Arg, Data> =
  | [MakeActionInput<Arg, Data>['handler'], MakeActionOptions?]
  | [MakeActionInput<Arg, Data>]

/** 这个辅助函数可以避免应用时输入泛型类型 */
export function makeActionInput<Arg, Data>(input: MakeActionInput<Arg, Data>) {
  return input
}

export function makeAction<Arg, Data>(...makeArgs: MakeActionArgs<Arg, Data>) {
  const handler = makeArgs[0] instanceof Function ? makeArgs[0] : makeArgs[0].handler
  const opts = (makeArgs[0] instanceof Function ? makeArgs[1] : omit(makeArgs[0], 'handler')) || {}
  opts.guard ??= 'user'
  // type NewPayload = typeof opts.schema extends ZodSchema ? z.infer<typeof opts.schema> : Payload
  type NewArgs = typeof opts.schema extends ZodSchema ? [z.infer<typeof opts.schema>] : Arg[]
  return async (...args: NewArgs) => {
    type ErrorResult = { readonly error: { msg: string }; data?: undefined }
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
        console.log('未登录', { opts })
        console.log([...headers().entries()])
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
        console.log('无管理员权限')
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
export type ActionResult<T> = ReturnType<ReturnType<typeof makeAction<unknown, T>>>

function getErrorMsg(error: unknown) {
  if (SqlXError.canParse(error)) {
    return SqlXError.getMessage(error)
  }
  if (error instanceof Error) {
    return error.message
  }
  return '未知错误'
}
