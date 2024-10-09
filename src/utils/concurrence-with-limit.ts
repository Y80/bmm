interface ConcurrenceWithLimitOptions {
  tasks: Array<() => Promise<any> | any>
  /**
   * 并发数
   * @default 4
   */
  limit?: number
  /**
   * 是否忽略任务的异常
   * @default true
   *
   * - 若为 true，则函数最终 resolve 的结果为所有任务的结果，且永远不会 reject
   * - 若为 false，只要有任一任务 reject，则函数直接 reject
   */
  ignoreError?: boolean
}

/**
 * 限定并发执行 limit 个任务
 */
export function concurrenceWithLimit(options: ConcurrenceWithLimitOptions) {
  const { tasks = [], limit = 4, ignoreError = true } = options
  const results = [] as any[]
  let runTaskIdx = 0

  return new Promise<any[]>((resolve, reject) => {
    function resolveOrContinue() {
      results.length === tasks.length ? resolve(results) : run()
    }

    function run() {
      const currentRunTaskIdx = runTaskIdx
      const task = tasks[runTaskIdx++]
      if (!task) return
      Promise.resolve(task())
        .then((result) => {
          results[currentRunTaskIdx] = result
          resolveOrContinue()
        })
        .catch((err) => {
          if (ignoreError) {
            results[currentRunTaskIdx] = err
            resolveOrContinue()
          } else {
            reject(err)
          }
        })
    }

    Array.from({ length: limit }).forEach(run)
  })
}
