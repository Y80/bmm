import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'
import { AdapterAccountType } from 'next-auth/adapters'

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ]
)

export const credentials = pgTable('credential', {
  userId: text('userId')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  password: text('password').notNull(), // 存储密码哈希
  salt: text('salt').notNull(),
})

export const userCredentialsRelations = relations(users, (ctx) => ({
  credential: ctx.one(credentials, {
    fields: [users.id],
    references: [credentials.userId],
  }),
}))
