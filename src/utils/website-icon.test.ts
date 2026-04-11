import { describe, expect, it, vi } from 'vitest'
import { buildWebsiteIconCandidates, probeWebsiteIcon } from '@/utils/website-icon'

describe('website-icon', () => {
  it('should build website icon candidates by origin', () => {
    expect(buildWebsiteIconCandidates('https://demo.local/admin/home?from=test')).toEqual([
      'https://demo.local/favicon.ico',
      'https://demo.local/logo.png',
      'https://demo.local/favicon.svg',
      'https://demo.local/favicon.png',
      'https://demo.local/logo.svg',
      'https://demo.local/favicon.jpg',
      'https://demo.local/favicon.webp',
      'https://demo.local/logo.jpg',
      'https://demo.local/logo.webp',
    ])
  })

  it('should return the first loadable icon candidate', async () => {
    const visited: string[] = []

    const iconUrl = await probeWebsiteIcon('https://demo.local/path', {
      timeout: 50,
      createImage: createProbeImageFactory(
        {
          'https://demo.local/favicon.ico': 'error',
          'https://demo.local/logo.png': 'load',
        },
        visited
      ),
    })

    expect(iconUrl).toBe('https://demo.local/logo.png')
    expect(visited.slice(0, 2)).toEqual([
      'https://demo.local/favicon.ico',
      'https://demo.local/logo.png',
    ])
    expect(visited).toHaveLength(9)
  })

  it('should return empty string when url is invalid', async () => {
    expect(buildWebsiteIconCandidates('not-a-url')).toEqual([])
    await expect(probeWebsiteIcon('not-a-url')).resolves.toBe('')
  })

  it('should resolve when any pending probe eventually succeeds', async () => {
    vi.useFakeTimers()
    const visited: string[] = []

    const task = probeWebsiteIcon('https://demo.local/path', {
      timeout: 10,
      createImage: createProbeImageFactory(
        {
          'https://demo.local/favicon.ico': 'pending',
          'https://demo.local/logo.png': 'load',
        },
        visited
      ),
    })

    await vi.advanceTimersByTimeAsync(0)

    await expect(task).resolves.toBe('https://demo.local/logo.png')
    expect(visited.slice(0, 2)).toEqual([
      'https://demo.local/favicon.ico',
      'https://demo.local/logo.png',
    ])
    expect(visited).toHaveLength(9)

    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should return empty string when all probes timeout or fail', async () => {
    vi.useFakeTimers()
    const task = probeWebsiteIcon('https://demo.local/path', {
      timeout: 10,
      createImage: createProbeImageFactory({}),
    })

    await vi.advanceTimersByTimeAsync(10)

    await expect(task).resolves.toBe('')

    vi.useRealTimers()
  })
})

function createProbeImageFactory(
  results: Record<string, 'load' | 'error' | 'pending'>,
  visited: string[] = []
) {
  return () => {
    let onload: null | (() => void) = null
    let onerror: null | (() => void) = null
    let src = ''

    return {
      get onload() {
        return onload
      },
      set onload(handler) {
        onload = handler
      },
      get onerror() {
        return onerror
      },
      set onerror(handler) {
        onerror = handler
      },
      get src() {
        return src
      },
      set src(value: string) {
        src = value
        if (!value) return
        visited.push(value)
        const result = results[value]
        if (result === 'load') {
          queueMicrotask(() => onload?.())
        }
        if (result === 'error') {
          queueMicrotask(() => onerror?.())
        }
      },
    } as unknown as HTMLImageElement
  }
}
