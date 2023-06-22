![](https://user-images.githubusercontent.com/4195550/189491183-d1352c71-a073-4d7b-99a8-8eda0e46b761.png)

# Top SvelteKit - Featured Packed Starter Template

The fastest and most comfortable development experience started template.
Everything comes installed for a speedy start with examples. Simply remove what you don't need and you are good to go :)

With 🧡 from [@ctwhome](https://github.com/ctwhome), feature-complete (WIP) according to [@swyx](https://youtu.be/A8jkJTWacow?t=10554).

## Features

*   [x] Latest SvelteKit
    *   [x] ESR, File-based routing, components auto importing, modules, etc.
    *   [x] TypeScript
    *   [x] Format on save with ESLint (VSCode Settings file and WebStorm)
    *   [x] Vite 3
*   [x] PWA - [vite-plugin-pwa](https://github.com/antfu/vite-plugin-pwa)
*   [x] [TailwindCSS 3](https://tailwindcss.com/) -
    *   [x] [DaisyUI](https://daisyui.com) - Theme CSS components for TailwindCSS
    *   [x] [Theme switcher](https://github.com/saadeghi/theme-change) - Custom theme and 22 themes to choose from.
*   [x] Styled Markdown HTML components and page routing
    *   [x] Render Svelte Components and HTML from markdown
    *   [x] Route-based \*.md pages
*   [x] Unplugin Icons- All icons demand - +100.000 SVG icons completely customizable
*   [x] SVG as a component (package)
*   [x] Cloud functions with endpoints and *-adapter (Node, Vercel and Netlify)
*   [ ] i18n Multi-language support
*   [ ] Vitest (with JSDom and @testing-library/svelte)




### BaaS (Backend-as-a-service)

*   [x] Supabase (Auth, Realtime, Storage, and of course PostgreSQL)
*   [ ] Firebase
*   [ ] Appwrite

### Feature examples

*   [x] Markdown route based blog
*   [ ] Scrolly telling (@svelte/scrolling)
*   [ ] CRUD Todo
*   [ ] Consuming API

### Extras

*   [x] Native File API with IndexedDB persistance
*   [x] Search Autocompete with defer

*   [ ] Feed RSS generator


## Components

*   [ ] Date pickers
*   [ ] Infinite scroll (Virtual Scroll)
*   [ ] Tables
*   [ ] Modals
*   [ ] Simple gallery image
*   [ ] Tooltips / toasts
*   [ ] Draggable
*   [ ] Time series charts
*   [ ] Rich text (Copy and page images)
*   [ ] Autocomplete
*   [ ] Todo CRUD
*   [ ] Auth
*   [ ] Protected routes

## Motivation and Personal Opinion

Svelte is the future, there is no other way. And having a clone-and-run repo with everything a basic web application needs is the best way to get started, spread the word, and create an even bigger ecosystem.

## Installation and running locally

```bash
npx degit ctwhome/top-sveltekit <directory-name>
pnpm install
```

## Updating fork

1.  Add remote from the original repository in your forked repository:

```shell
git remote add upstream git://github.com/ctwhome/top-sveltekit.git
git fetch upstream
```

1.  Updating your fork from the original repo to keep up with their changes:
    `git pull upstream main`

Start the development server on [http://localhost:5137](http://localhost:3000)

```bash
pnpm dev
```

## IDE

We recommend using [VS Code](https://code.visualstudio.com/) with eslint and prettier (Tailwindcss plugging to organize the classes )

Recommended plugins popup

## Production

Depending on the adaptor you choose, either SSR, SSG...etc

```bash
pnpm build
```
