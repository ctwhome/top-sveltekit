# Technical Context

## Technologies Used

### Core Technologies
- **SvelteKit**: v2.16.0 - Frontend framework
- **Bun.js**: Runtime environment and package manager
- **TypeScript**: v5.7.3 - Type safety and development experience
- **PostgreSQL**: Database system

### Frontend
- **TailwindCSS**: v3.4.17 - Utility-first CSS
- **DaisyUI**: v4.12.23 - Component library
- **Svelte**: v5.19.0 - Component framework

### Authentication
- **Auth.js**: v1.7.4 (@auth/sveltekit)
- **PostgreSQL Adapter**: @auth/pg-adapter
- Providers:
  - Email (Resend)
  - Google OAuth
  - Credentials (username/password)

### Database
- **node-pg-migrate**: v7.9.0 - Database migrations
- **pg**: v8.13.1 - PostgreSQL client for Auth.js
- **postgres.js**: v3.4.5 - Modern PostgreSQL client for application queries

## Development Setup

### Prerequisites
- Node.js installed
- Bun.js installed (recommended) or pnpm
- PostgreSQL database
- IDE with TypeScript support (VS Code recommended)

### Environment Variables
Required variables:
```
DATABASE_URL=postgres://user:pass@host:port/dbname
AUTH_SECRET=your-auth-secret
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

### Development Commands
- `bun dev`: Start development server
- `bun migrate`: Run database migrations
- `bun build`: Build for production
- `bun preview`: Preview production build

## Technical Constraints

### Database
- PostgreSQL required
- Two database clients used:
  - pg for Auth.js compatibility
  - postgres.js for better performance in application queries
- SQL-based migrations only

### Authentication
- Single role per user
- JWT-based sessions
- Email provider requires Resend API setup
- Google OAuth requires proper configuration

### Performance
- Component-level code splitting
- Image optimization required
- Proper caching strategies needed

### Development
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Git-based workflow

## Testing and Quality

### Linting and Formatting
- ESLint with TypeScript support
- Prettier with Svelte plugin
- Tailwind plugin for CSS

### Testing Tools
- Vitest available for testing
- Component testing support
- E2E testing possible with additional setup

### Build and Deploy
- Vercel-ready configuration
- Environment-based builds
- Static file optimization
