import { auth } from '@/lib/auth'
import SqlXError from '@/lib/SqlXError'
import { to } from '@/utils'
import { IS_DEV, PageRoutes } from '@cfg'
import { omit } from 'lodash'
import { redirect } from 'next/navigation'
import { z, ZodSchema } from 'zod'

interface MakeActionOptions {
  /**
   * 接口守卫
   * - false: 不需要登录
   * - 'user': 需要登录
   * - 'admin': 需要管理员权限
   * @default 'user'
   */
  guard?: false | 'user' | 'admin'
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
  type ActionArgs = typeof opts.schema extends ZodSchema ? [z.infer<typeof opts.schema>] : Args
  type ErrorResult = { error: { msg: string }; data?: undefined }
  async function action(...args: ActionArgs) {
    if (opts.schema) {
      const result = opts.schema.safeParse(args[0])
      if (!result.success) {
        const msg = '参数错误：' + result.error.issues.pop()?.message || '未知的参数错误'
        return { error: { msg } } as ErrorResult
      }
      args[0] = result.data
    }

    if (opts.guard) {
      const session = await auth()
      if (!session) {
        redirect(PageRoutes.LOGIN)
      }
      if (opts.guard === 'admin' && !session.user.isAdmin) {
        redirect(PageRoutes.LOGIN)
      }
    }

    const [error, data] = await to(handler(...args))
    if (error) {
      IS_DEV && console.error(error)
      return { error: { msg: getErrorMsg(error) } } as ErrorResult
    }
    return { data, error: undefined } as const
  }
  return action
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
