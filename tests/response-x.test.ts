import ResponseX from '@/utils/response-x'
import { describe, expect, test } from 'vitest'

describe('G: ResponseX', () => {
  describe('W: Body is object', () => {
    let body = { data: '👍1' }
    test('T: ', async () => {
      let resX = ResponseX.ok(body)
      console.log(resX)
      expect(await resX.json()).toEqual(await Response.json(body).json())
    })
  })

  describe('W: Body is Date', () => {
    let body = new Date()
    test('T:', async () => {
      let resX = ResponseX.ok(body as any)
      console.log(resX)
      expect(await resX.text()).toEqual(await new Response(body as any).text())
    })
  })

  describe('W: Body is custom object', () => {
    class CustomObject {
      name: string
      constructor() {
        this.name = '😊'
      }
    }
    let body = new CustomObject()
    test('T:', async () => {
      let resX = ResponseX.ok(body as any)
      console.log(resX)
      expect(await resX.json()).toEqual(await Response.json(body).json())
    })
  })
})
