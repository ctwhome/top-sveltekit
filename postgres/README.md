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

- **Simplicity in code**: Update Svelte stores locally and let syncing happen in the background
- **Future scalability**: Real-time sync, offline-first capabilities
- **Role-Based Access Control**: Server-side authorization with built-in role management


## Quick Start
1. Copy `.env.example` to `.env` and fill in the required variables

## Runnin with Docker
It will run the database, migrations and frontend services.
```bash
docker compose up
```
### Feeding the database for devepment
```bash
# Start everything (including the seed service):
docker compose --profile seed up
# or just run the seed container on demand:
docker compose --profile seed run seed
```

### Docker utils
```bash
docker compose down -v # Remove all volumes, carefull all data will be lost.
docker compose logs -f
```


## Running locally without docker and external database url (or i.e. local postgres running on port 5432)
```bash
bun install
bun dev
```

Visit [http://localhost:5173](http://localhost:5173) to open the application.
