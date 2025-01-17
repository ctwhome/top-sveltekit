# Drizzle example with


```sql
CREATE DATABASE my_new_db;
CREATE USER my_new_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE my_new_db TO my_new_user;
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
