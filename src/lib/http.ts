import toast from 'react-hot-toast'

type HTTPReturn<DataType> = Promise<
  | { error: { message: string; [p: string]: any }; data: undefined }
  | { error: undefined; data: DataType }
>

type Args = [url: string, payload?: Record<string, any> | null, options?: RequestInit]

type ArgsWithoutMethod = [
  url: string,
  payload?: Record<string, any>,
  options?: Omit<RequestInit, 'method'>,
]

interface IHttp {
  <T = any>(...args: Args): HTTPReturn<T>
  get<T = any>(...args: ArgsWithoutMethod): HTTPReturn<T>
  post<T = any>(...args: ArgsWithoutMethod): HTTPReturn<T>
  put<T = any>(...args: ArgsWithoutMethod): HTTPReturn<T>
  patch<T = any>(...args: ArgsWithoutMethod): HTTPReturn<T>
  delete<T = any>(...args: ArgsWithoutMethod): HTTPReturn<T>
}

const http: IHttp = async (url, payload, options) => {
  if (!url) {
    return { error: { message: '❌ Invalid URL.' }, data: undefined }
  }
  if (url.startsWith('http')) {
    url = url
  } else {
    const urlInstance = new URL(url, location.origin)
    url = urlInstance.href
  }

  let _options: RequestInit = {
    method: Method.GET,
    ...options,
    headers: { ...options?.headers },
  }
  let req: Request
  if (payload) {
    // 仅 GET 将参数放在 querystring 中，其余放在 body 中
    if (/GET/i.test(_options.method!)) {
      const clearedPayload = Object.keys(payload).reduce((acc: any, key) => {
        const val = payload[key]
        if ([undefined, null, ''].includes(val)) return acc
        return Object.assign(acc, { [key]: val })
      }, {})
      const searchParams = new URLSearchParams(clearedPayload).toString()
      req = new Request(url + '?' + searchParams, _options)
      // let searchParams = '?'
      // Object.entries(payload).forEach(([key, value]) => {
      //   // {k: [1, 2, 3]} => k=1&k=2&k=3，这样在 server 上，body.query 为 string[]
      //   // 不支持嵌套
      //   if ([undefined, null, ''].includes(value)) return
      //   if (Array.isArray(value)) {
      //     value.forEach((valueItem) => {
      //       searchParams += `&${key}=${String(valueItem)}`
      //     })
      //   } else {
      //     searchParams += `&${key}=${String(value)}`
      //   }
      // })
      // searchParams = searchParams.replace('?&', '?')
      // req = new Request(url + searchParams, _options)
    } else {
      _options.headers = { ..._options.headers, 'Content-Type': 'application/json' }
      _options.body = JSON.stringify(payload)
      req = new Request(url, _options)
    }
  } else {
    req = new Request(url, _options)
  }

  const rsp = await fetch(req)
  const data = /application\/json/i.test(rsp.headers.get('Content-Type') || '')
    ? await rsp.json()
    : await rsp.text()
  // rsp.ok: status in the range 200 - 299
  if (!rsp.ok) {
    const error = {
      message: data?.msg || data?.message || data || '未知错误',
      data,
      request: req,
      response: rsp,
    }
    // 默认的错误处理
    toast.error(error.message)
    return { error, data: undefined }
  }
  return { data, error: undefined }
}

http.get = (url, payload, options) => http(url, payload, { ...options, method: 'GET' })

/** 创建实体 */
http.post = (url, payload, options) => http(url, payload, { ...options, method: 'POST' })

/** 用于高级搜索——即使 PUT 本应用于更换实体 */
http.put = (url, payload, options) => http(url, payload, { ...options, method: 'PUT' })

/** 用于更新实体中的部分 */
http.patch = (url, payload, options) => http(url, payload, { ...options, method: 'PATCH' })

/** 删除实体 */
http.delete = (url, payload, options) => http(url, payload, { ...options, method: 'DELETE' })

export default http

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  /** The modification update successful, but the server not returning any content */
  NO_CONTENT = 204,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,

  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
