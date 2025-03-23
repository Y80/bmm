/**
 * 在某些场景中，如 Action、热重载...
 *
 * 模块内的顶级变量可能会被声明多份，导致结果和预期不符、资源浪费
 *
 * 为了避免这种情况，通过 initGlobalData() 函数来确保变量只被声明一次
 */

interface InitGlobalDataParams<T> {
  key: string
  initialData: () => T
}

export function initGlobalData<T>(params: InitGlobalDataParams<T>) {
  const g = global as any
  const key = '__bmm_' + params.key
  if (!g[key]) {
    g[key] = params.initialData()
  }
  return g[key] as T
}
