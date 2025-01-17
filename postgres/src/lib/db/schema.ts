import { pgTable, serial, varchar, text, timestamp, integer, boolean, uuid, unique, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  emailVerified: timestamp('emailVerified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  role: varchar('role', { length: 50 })
});

// Verification token table
export const verificationTokens = pgTable('verification_token', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull()
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
}));

// Accounts table
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  id_token: text('id_token'),
  scope: text('scope'),
  session_state: text('session_state'),
  token_type: text('token_type')
}, (account) => ({
  providerProviderAccountIdIndex: unique().on(account.provider, account.providerAccountId)
}));

// Todos table
export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  todos: many(todos)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id]
  })
}));
