import { SelectPublicTag } from '@/db'
import { type ClassValue, clsx } from 'clsx'
import { pinyin } from 'pinyin-pro'
import { twMerge } from 'tailwind-merge'

export function isValidUrl(url?: string) {
  try {
    return new URL(url || '')
  } catch (error) {
    return false
  }
}

export function robustUrl(url?: string) {
  if (!url) return false
  const list = [url, 'https://' + url, 'http://' + url]
  for (const url of list) {
    const inst = isValidUrl(url)
    if (inst) {
      return inst.href
    }
  }
  return false
}

export function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt)
        return [parsedError, undefined]
      }

      return [err, undefined]
    })
}

export function mergeResponseInit(
  init: ResponseInit | undefined,
  otherInit: Omit<ResponseInit, 'statusCode'>
) {
  const newInit: ResponseInit = { ...init }
  if (otherInit.status) {
    newInit.status = otherInit.status
  }
  if (otherInit.headers) {
    newInit.headers = mergeHeaders(init?.headers, otherInit.headers)
  }
  return newInit
}

export function mergeHeaders(headers: HeadersInit | undefined, otherHeaders: HeadersInit) {
  const newHeaders = new Headers(headers)
  // headers.set() will override existing keys
  if (Array.isArray(otherHeaders)) {
    otherHeaders.forEach(([key, value]) => newHeaders.set(key, value))
  } else if (otherHeaders instanceof Headers) {
    otherHeaders.forEach((value, key) => newHeaders.set(key, value))
  } else {
    for (const key in otherHeaders) {
      newHeaders.set(key, otherHeaders[key])
    }
  }
  return newHeaders
}

export function createQueryObject(url: string) {
  const params = new URL(url).searchParams
  return [...params.keys()].reduce(
    (prev, key) => {
      // prev[curr] = params.getAll(curr)
      if (params.has(key)) {
        prev[key] = params.get(key)!
      }
      return prev
    },
    {} as Record<string, string>
  )
}

export function testTagNameOrPinyin(
  input: string,
  tag: Partial<Pick<SelectPublicTag, 'name' | 'pinyin'>>
) {
  const { name = '' } = tag
  let { pinyin = '' } = tag
  if (!pinyin && name) {
    pinyin = getPinyin(name)
  }
  const reg = new RegExp(input, 'i')
  return (
    reg.test(name) ||
    reg.test(pinyin) ||
    reg.test(pinyin.replace(/\s/g, '')) ||
    // 博客(bo ke) -> bk ✅
    reg.test(
      pinyin
        .split(' ')
        .map((v) => v.charAt(0))
        .join('')
    )
  )
}

export function getPinyin(word: string) {
  return pinyin(word, { toneType: 'none', nonZh: 'consecutive' })
}

/**
 * 是否为 serverless 运行环境
 */
export function isServerless() {
  return process.env.SERVERLESS || process.env.VERCEL
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
