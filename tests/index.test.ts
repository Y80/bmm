import { describe, expect, it, test } from 'vitest'

describe('Suite1', () => {
  test('1 + 2 = 3', () => {
    expect(1 + 2).toBe(3)
    expect(1 + 2, '也可以有多个断言').toBe(3)
  })

  it('1 + 3 = 4', () => {
    expect(1 + 3).toBe(4)
  })
})
