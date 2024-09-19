import { describe, test } from 'vitest'
import { analyzeWebsite } from '.'

describe('Get HTML String', () => {
  test('', { timeout: 30 * 1000 }, async () => {
    const url = 'http://gitlab.cn/'
    console.log(await analyzeWebsite(url))
  })
})
