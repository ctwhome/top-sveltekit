# Drizzle example with
Locally using a drizzle datbase

```sql
CREATE DATABASE drizzle;
CREATE USER my_new_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE drizzle TO my_new_user;
```


## Developing

```bash
bun run dev
bun run db:push   # "drizzle-kit push",
bun run db:migrate # drizzle-kit migrate",
bun run db:studio  # drizzle-kit studio"

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
