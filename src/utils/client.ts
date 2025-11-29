/**
 * @file 放置只能在客户端使用的函数（如操作 localStorage 的函数）。
 */

'use client'

import { ActionResult } from '@/actions/make-action'
import { addToast } from '@heroui/react'

/**
 * 客户端执行 Action，并处理 Action 结果，自动 toast 展示错误信息，返回 ok 和 data?
 */
export async function runAction<U extends any[], Data>(
  actionRes: ActionResult<U, Data>,
  opts: {
    okMsg?: string
    errToast?: { title?: string; hidden?: boolean }
    onOk?: (data: Data) => void | Promise<void>
  } = {}
) {
  const res = await actionRes
  if (res.error) {
    if (!opts.errToast?.hidden) {
      addToast({
        color: 'danger',
        title: opts.errToast?.title || '操作失败',
        description: res.error.msg,
      })
    }
    return { ok: false, message: res.error.msg } as const
  }
  if (opts.okMsg) {
    addToast({
      color: 'success',
      title: '操作成功',
      description: opts.okMsg,
    })
  }
  opts.onOk?.(res.data)
  return { ok: true, data: res.data } as const
}
