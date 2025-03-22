import { auth } from '@/lib/auth'
import SqlXError from '@/lib/SqlXError'
import { pageSpace, to } from '@/utils'
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
  /** 方便 Debug */
  name?: string
}

interface MakeActionOptionsWithHandler<Args extends any[], Data> extends MakeActionOptions {
  handler: (...args: Args) => Promise<Data>
}

/** 这个辅助函数可以避免应用时输入泛型类型 */
export function makeActionInput<Args extends any[], Data>(
  input: MakeActionOptionsWithHandler<Args, Data>
) {
  return input
}

type MakeActionArgs<Args extends any[], Data> =
  | [MakeActionOptionsWithHandler<Args, Data>['handler'], MakeActionOptions?]
  | [MakeActionOptionsWithHandler<Args, Data>]
export function makeAction<Args extends any[], Data>(...makeArgs: MakeActionArgs<Args, Data>) {
  const handler = makeArgs[0] instanceof Function ? makeArgs[0] : makeArgs[0].handler
  const opts = (makeArgs[0] instanceof Function ? makeArgs[1] : omit(makeArgs[0], 'handler')) || {}
  opts.guard ??= 'user'
  // type NewPayload = typeof opts.schema extends ZodSchema ? z.infer<typeof opts.schema> : Payload
  type NewArgs = typeof opts.schema extends ZodSchema
    ? [z.infer<typeof opts.schema>]
    : Parameters<typeof handler>
  type ErrorResult = { readonly error: { msg: string }; data?: undefined }
  return async (...args: NewArgs) => {
    // type SuccessResult = { readonly error?: undefined; readonly data: Data }
    // let payload = args[0]
    if (opts.schema) {
      const result = opts.schema.safeParse(args[0])
      if (!result.success) {
        return {
          error: { msg: '参数错误：' + result.error.issues.pop()?.message || '未知的参数错误' },
        } as ErrorResult
      }
      // payload = result.data
      args[0] = result.data
    }

    if (opts.guard) {
      const session = await auth()
      // console.log('auth() 返回的 session:\n', session)
      if (!session) {
        console.log('未登录', handler.name, { opts })
        console.log([...headers().entries()])
        redirect(PageRoutes.LOGIN)
      }
      let checkIsAdmin = false
      if (opts.guard === 'decide-by-referer') {
        const referer = headers().get('referer')
        if (!referer) return { error: { msg: '无效请求' } } as ErrorResult
        checkIsAdmin = pageSpace(referer).isAdmin
      } else if (opts.guard === 'admin') {
        checkIsAdmin = true
      }
      if (checkIsAdmin && !session.user.isAdmin) {
        redirect(PageRoutes.LOGIN)
      }
    }

    const [error, data] = await to(handler(...args))
    if (error) {
      process.env.NODE_ENV === 'development' && console.error(error)
      return { error: { msg: getErrorMsg(error) } } as ErrorResult
    }
    return { data, error: undefined } as const
  }
}
export type ActionResult<Args extends any[], Data> = ReturnType<
  ReturnType<typeof makeAction<Args, Data>>
>

function getErrorMsg(error: unknown) {
  if (SqlXError.canParse(error)) {
    return SqlXError.getMessage(error)
  }
  if (error instanceof Error) {
    return error.message
  }
  return '未知错误'
}
