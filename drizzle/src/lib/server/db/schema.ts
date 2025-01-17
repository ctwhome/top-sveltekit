import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const todos = pgTable('todos', {
	id: serial('id').primaryKey(),
	content: text('content').notNull(),
	completed: boolean('completed').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow()
});
