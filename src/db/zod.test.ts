import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'
import { zodSchema } from './zod'

// https://orm.drizzle.team/docs/zod
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#server-side-validation-and-error-handling

describe('G: zod schema - publicTags', () => {
  describe('W: insert', () => {
    test('pass', () => {
      let validateRes = zodSchema.publicTags.insert().safeParse({ name: 'tag1' })
      expect(validateRes.success).toBe(true)
    })

    test('miss name field', () => {
      let validateRes = zodSchema.publicTags.insert().safeParse({})
      expect(validateRes.success).toBe(false)
    })

    test('name is not string', () => {
      let validateRes = zodSchema.publicTags.insert().safeParse({ name: 1 })
      expect(validateRes.success).toBe(false)
    })
  })

  describe('W: update', () => {
    test('pass', () => {
      let res = zodSchema.publicTags.update().safeParse({ id: 1 })
      expect(res.success).toBe(true)
    })

    test('miss id field', () => {
      let validateRes = zodSchema.publicTags.update().safeParse({})
      expect(validateRes.success).toBe(false)
    })

    test('id is not number', () => {
      let validateRes = zodSchema.publicTags.update().safeParse({ id: true })
      expect(validateRes.success).toBe(false)
    })
  })

  describe('W: delete', () => {
    test('pass', () => {
      let res = zodSchema.publicTags.delete().safeParse({ id: 1 })
      expect(res.success).toBe(true)
    })

    test('miss id field', () => {
      let validateRes = zodSchema.publicTags.delete().safeParse({})
      expect(validateRes.success).toBe(false)
    })

    test('id is not number', () => {
      let validateRes = zodSchema.publicTags.delete().safeParse({ id: true })
      expect(validateRes.success).toBe(false)
    })
  })
})

describe.only('G: publicBookmarks', () => {
  describe('W: insert', () => {
    test('pass', () => {
      let res = zodSchema.publicBookmarks.insert().safeParse({
        url: faker.internet.url(),
        name: faker.word.noun(),
        icon: faker.image.url(),
        description: faker.lorem.lines(),
        tags: [1],
      })
      expect(res.success).toBe(true)
    })
  })
})
