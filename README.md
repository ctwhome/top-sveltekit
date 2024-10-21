# Ctwhome top-sveltekit
Unified template with SvelteKit, TailwindCSS, DaisyUI, Auth, Postgres, and more.\
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

## Using the Makefile to run the project

A `Makefile` has been added to manage docker compose tasks for powersync. The `Makefile` includes targets for running the development, local, and production versions of the docker compose.

### Running the development version
To run the development version of the docker compose, use the following command:
```bash
make dev
```

### Running the local version
To run the local version of the docker compose, use the following command:
```bash
make local
```

### Running the production version
To run the production version of the docker compose, use the following command:
```bash
make prod
```

### Stopping all running services
To stop all running docker compose services, use the following command:
```bash
make stop
```

### Building all services
To build all docker compose services, use the following command:
```bash
make build
```

### Cleaning up
To remove all docker compose services, use the following command:
```bash
make clean
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

To run the production version of the docker compose, use the following command:
```bash
make prod
```
