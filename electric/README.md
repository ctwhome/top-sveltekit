# Postgres + SvelteKit + Electric PLAYGROUND

Electric is not yet implemented, but i woudl like to use this as a playground


### Apply DB schema
You can directly apply changes to your database using the drizzle-kit push command. This is a convenient method for quickly testing new schema designs or modifications in a local development environment, allowing for rapid iterations without the need to manage migration files:
```
bunx drizzle-kit push
```
Read more about the push command in [documentation](https://orm.drizzle.team/docs/get-started/postgresql-new)

#### Tips
Alternatively, you can generate migrations using the drizzle-kit generate command and then apply them using the drizzle-kit migrate command:

Generate migrations:
```
bunx drizzle-kit generate
```
Apply migrations:
```
bunx drizzle-kit migrate
```
