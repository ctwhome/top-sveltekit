# Top-SvelteKit Template

A unified full-stack template with SvelteKit (Svelte 5), TailwindCSS, DaisyUI, AuthJS, Postgres, and more.\
by [ctwhome](https://ctwhome.com)


## Documentation
- [Installation Guide](docs/INSTALLATION.md) - Complete setup instructions
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and best practices
- [Database Guide](docs/DATABASE.md) - Database setup and migrations
- [Authentication Guide](docs/AUTH.md) - Authentication system documentation
- [API Documentation](docs/API.md) - Available API endpoints


![System Architecture](docs/diagram.excalidraw.png)

## Features

- **Local-first architecture**: Data lives locally and syncs with the database seamlessly
- **Simplicity in code**: Update Svelte stores locally and let syncing happen in the background
- **Future scalability**: Real-time sync, offline-first capabilities
- **Role-Based Access Control**: Server-side authorization with built-in role management


## Quick Start

```bash
# Clone the repository
bunx degit ctwhome/top-sveltekit <directory-name>

# Install dependencies
bun install

# Start development server
bun dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application.
