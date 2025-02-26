import { InsertPublicTag, db, schema } from '@/db'
import { faker } from '@faker-js/faker'

const { publicTags } = schema

export function mockTag() {
  const tag: InsertPublicTag = {
    name: faker.word.noun(),
    icon: 'tabler:search',
    color: faker.color.rgb(),
    isMain: Boolean(faker.number.int({ max: 1 })),
    pinyin: 'pinyin',
  }
  return tag
}

export async function batchCreateTags(num = 5) {
  const tags: InsertPublicTag[] = []
  for (let i = 0; i < num; i++) {
    tags.push(mockTag())
  }
  return await db.insert(publicTags).values(tags).returning()
}
