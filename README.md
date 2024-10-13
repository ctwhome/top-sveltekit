# Ctwhome top-sveltekit

Unified interface for chatGPT, Gemini, Claude and more.



Steps:

1. Install the dependencies with `pnpm install`
2. Generate the google OAUTH credentials for the auth.js adapter

3. copy the .env.local.example file to .env.local
4. fill in the .env.local file with your own values
5. copy the .env.example file to .env
6. run `npx auth secret` to generate a secret key for the auth.js adapter

```bash
pnpm dev
```


## Production

Build the application for production:

```bash
pnpn build
```

