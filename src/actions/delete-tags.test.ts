import { actDeletePublicTags, actDeleteUserTags } from '@/actions'
import { deleteTagsSchema } from '@/controllers/schemas'
import { db, schema } from '@/db'
import { getAuthedUserId } from '@/lib/auth'
import { inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { expect, test, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: async () => ({ user: { isAdmin: true } }),
  getAuthedUserId: vi.fn(),
}))

const { publicTags, users, userTags } = schema

test('normalizes numeric strings and rejects invalid selections', () => {
  expect(deleteTagsSchema.parse({ ids: ['12', 34] })).toEqual({ ids: [12, 34] })
  for (const ids of [[], ['abc'], [''], [1.5]]) {
    expect(deleteTagsSchema.safeParse({ ids }).success).toBe(false)
  }
})

test('batch deletes public tags using numeric row IDs', async () => {
  const tags = await db
    .insert(publicTags)
    .values(Array.from({ length: 3 }, () => ({ name: nanoid(12) })))
    .returning({ id: publicTags.id })
  const [first, second, unselected] = tags
  const allIds = tags.map((tag) => tag.id)

  try {
    const result = await actDeletePublicTags({ ids: [first.id, second.id] })
    expect(result.error).toBeUndefined()
    expect(new Set(result.data?.map((tag) => tag.id))).toEqual(new Set([first.id, second.id]))
    const remaining = await db.query.publicTags.findMany({
      where: inArray(publicTags.id, allIds),
      columns: { id: true },
    })
    expect(remaining).toEqual([unselected])
  } finally {
    await db.delete(publicTags).where(inArray(publicTags.id, allIds))
  }
})

test('batch deletes numeric user-tag IDs only for the current user', async () => {
  const [owner, other] = await db
    .insert(users)
    .values(Array.from({ length: 2 }, () => ({ email: `${nanoid(12)}@example.com` })))
    .returning({ id: users.id })
  vi.mocked(getAuthedUserId).mockResolvedValue(owner.id)

  try {
    const [first, second, protectedTag] = await db
      .insert(userTags)
      .values([owner, owner, other].map(({ id }) => ({ name: nanoid(12), userId: id })))
      .returning({ id: userTags.id })
    const result = await actDeleteUserTags({ ids: [first.id, second.id, protectedTag.id] })
    expect(result.error).toBeUndefined()
    expect(new Set(result.data?.map((tag) => tag.id))).toEqual(new Set([first.id, second.id]))
    const remaining = await db.query.userTags.findMany({
      where: inArray(userTags.userId, [owner.id, other.id]),
      columns: { id: true },
    })
    expect(remaining).toEqual([protectedTag])
  } finally {
    await db.delete(userTags).where(inArray(userTags.userId, [owner.id, other.id]))
    await db.delete(users).where(inArray(users.id, [owner.id, other.id]))
  }
})
