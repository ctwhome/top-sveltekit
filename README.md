# Ctwhome top-sveltekit
Unified template with SvelteKit (Svelte 5), TailwindCSS, DaisyUI, Auth, Postgres, and more.\
by [ctwhome](https://ctwhome.com)


## Installation and running locally
```bash
npx degit ctwhome/top-sveltekit <directory-name>
```

Steps:
1. Install the dependencies with `pnpm install`
2. Generate the google OAUTH credentials for the auth.js adapter

3. copy the .env.local.example file to .env.local
4. fill in the .env.local file with your own values
5. copy the .env.example file to .env
6. run `npx auth secret` to generate a secret key for the auth.js adapter


Run locally:
```bash
pnpm dev
```

## Using the Makefile to run docker compose for powersync

### Development
To run the development version of the docker compose for powersync, use the following command:
```bash
make dev
```

### Local
To run the local version of the docker compose for powersync, use the following command:
```bash
make local
```

### Production
To run the production version of the docker compose for powersync, use the following command:
```bash
make prod
```

## Updating fork
1.  Add remote from the original repository in your forked repository:
```shell
git remote add upstream git://github.com/ctwhome/top-sveltekit.git
git fetch upstream
```
1.  Updating your fork from the original repo to keep up with their changes:
    `git pull upstream main`

Start the development server on [http://localhost:5173](http://localhost:5173)

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```
