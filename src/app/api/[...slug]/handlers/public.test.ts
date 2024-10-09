import { describe, test } from 'vitest'
import { PublicTagHandler } from './public'

describe('PublicTagHandler', () => {
  test('insert without any fields', async () => {
    const req = new Request('http://a.com', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    // console.log(await req.json())
    const res = await PublicTagHandler.insert(req)
    console.log(res)
  })
})
