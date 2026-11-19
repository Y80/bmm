import UserController from '@/controllers/User.controller'
import { findManyUsersSchema } from '@/controllers/schemas'
import { db, schema } from '@/db'
import { inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { expect, test } from 'vitest'

test('records the latest login and sorts it in either direction with missing times last', async () => {
  const keyword = `login-${nanoid(10)}`
  const { users } = schema
  const [first, second, noLogin] = await db
    .insert(users)
    .values([
      { email: `${keyword}-first@example.com`, role: 'admin' },
      { email: `${keyword}-second@example.com`, role: 'user' },
      { email: `${keyword}-unknown@example.com`, role: 'admin' },
    ])
    .returning({ id: users.id })

  const earlier = new Date('2026-01-01T08:00:00.000Z')
  const later = new Date('2026-02-01T08:00:00.000Z')
  try {
    await UserController.recordLogin(first.id, earlier)
    await UserController.recordLogin(second.id, later)
    await UserController.recordLogin(second.id, earlier)

    const descending = await UserController.findMany(
      findManyUsersSchema.parse({ keyword, sorterKey: '-lastLoginTime' })
    )
    const ascending = await UserController.findMany(
      findManyUsersSchema.parse({ keyword, sorterKey: '+lastLoginTime' })
    )
    expect(descending.list.map(({ id, lastLoginAt }) => ({ id, lastLoginAt }))).toEqual([
      { id: second.id, lastLoginAt: later },
      { id: first.id, lastLoginAt: earlier },
      { id: noLogin.id, lastLoginAt: null },
    ])
    expect(ascending.list.map(({ id }) => id)).toEqual([first.id, second.id, noLogin.id])
  } finally {
    await db.delete(users).where(inArray(users.id, [first.id, second.id, noLogin.id]))
  }
})
