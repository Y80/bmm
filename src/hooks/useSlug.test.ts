import { describe, expect, test } from 'vitest'
import { parseSlug } from './useSlug'

describe('parseSlug', () => {
  test('识别新建页面', () => {
    expect(parseSlug('new')).toEqual({
      isNew: true,
      number: null,
    })
  })

  test('识别编辑页面 ID', () => {
    expect(parseSlug('12')).toEqual({
      isNew: false,
      number: 12,
    })
  })

  test('拒绝无效参数', () => {
    expect(() => parseSlug('abc')).toThrowError('无效的页面参数')
    expect(() => parseSlug()).toThrowError('无效的页面参数')
  })
})
