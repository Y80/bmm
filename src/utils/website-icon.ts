const WEBSITE_ICON_CANDIDATE_PATHS = [
  '/favicon.ico',
  '/logo.png',
  '/favicon.svg',
  '/favicon.png',
  '/logo.svg',
  '/favicon.jpg',
  '/favicon.webp',
  '/logo.jpg',
  '/logo.webp',
] as const

type ProbeImage = Pick<HTMLImageElement, 'onload' | 'onerror' | 'src'>

interface ImageProbe {
  promise: Promise<boolean>
  cancel: () => void
}

export function buildWebsiteIconCandidates(url: string) {
  if (!URL.canParse(url)) return []

  const origin = new URL(url).origin
  return WEBSITE_ICON_CANDIDATE_PATHS.map((path) => new URL(path, origin).href)
}

/**
 * 并发探测网站常见图标路径，返回首个成功的图标地址
 */
export async function probeWebsiteIcon(
  url: string,
  opts: {
    timeout?: number
    createImage?: () => ProbeImage
  } = {}
) {
  const { timeout = 5000, createImage = () => new Image() } = opts
  const candidates = buildWebsiteIconCandidates(url)

  if (!candidates.length) return ''

  return await new Promise<string>((resolve) => {
    let settled = false
    let pending = candidates.length
    const probes = candidates.map((iconUrl) => ({
      iconUrl,
      probe: createImageProbe(iconUrl, { timeout, createImage }),
    }))

    const stop = (iconUrl: string) => {
      if (settled) return
      settled = true
      probes.forEach((item) => item.probe.cancel())
      resolve(iconUrl)
    }

    probes.forEach(({ iconUrl, probe }) => {
      probe.promise.then((matched) => {
        if (matched) {
          stop(iconUrl)
          return
        }

        pending -= 1
        if (!pending) {
          stop('')
        }
      })
    })
  })
}

/**
 * 使用 Image 的 load/error 事件判断图标地址是否可用
 */
function createImageProbe(
  iconUrl: string,
  opts: {
    timeout: number
    createImage: () => ProbeImage
  }
) : ImageProbe {
  const img = opts.createImage()
  let settled = false

  const cleanup = () => {
    clearTimeout(timer)
    img.onload = null
    img.onerror = null
    img.src = ''
  }

  const finish = (result: boolean, resolve: (value: boolean) => void) => {
    if (settled) return
    settled = true
    cleanup()
    resolve(result)
  }

  const timer = setTimeout(() => onDone(false), opts.timeout)
  let onDone = (_result: boolean) => {}

  return {
    promise: new Promise<boolean>((resolve) => {
      onDone = (result) => finish(result, resolve)
      img.onload = () => onDone(true)
      img.onerror = () => onDone(false)
      img.src = iconUrl
    }),
    cancel() {
      if (settled) return
      settled = true
      cleanup()
    },
  }
}

export { WEBSITE_ICON_CANDIDATE_PATHS }
