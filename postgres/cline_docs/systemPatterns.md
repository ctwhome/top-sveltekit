# System Patterns

## Architecture Overview

### Tech Stack
- **Frontend Framework**: SvelteKit (modern, performant web framework)
- **Runtime**: Bun.js (fast JavaScript runtime)
- **Database**: PostgreSQL (reliable, feature-rich database)
- **Authentication**: Auth.js (@auth/sveltekit with multiple providers)
- **UI Framework**: TailwindCSS + DaisyUI
- **Type Safety**: TypeScript throughout

### Directory Structure
```
├── src/
│   ├── lib/           # Shared components and utilities
│   ├── routes/        # SvelteKit routes
│   └── app.d.ts       # TypeScript declarations
├── migrations/        # Database migrations
├── docs/             # Documentation
└── static/           # Static assets
```

## Key Technical Decisions

### 1. Database Management
- **Client Choice**:
  - pg for Auth.js adapter
  - postgres.js for application queries (better performance)
- **Migration Tool**: node-pg-migrate for SQL-based migrations
- **Connection Management**: Environment-based configuration

### 2. Authentication System
- Multiple provider support (Email, Google, Credentials)
- JWT-based session management
- Simplified RBAC with single role per user
- Type-safe role handling

### 3. Frontend Architecture
- Component-based UI development
- Store-based state management
- Progressive TypeScript implementation
- Lazy loading for performance

### 4. Development Workflow
- Bun.js for faster development
- Environment-based configurations
- Structured migration system
- Type-safe development

## Design Patterns

### 1. Component Architecture
- Small, focused components
- Clear separation of concerns
- Reusable UI components
- Store-based state management

### 2. Database Patterns
- SQL-first migrations
- Parameterized queries
- Transaction support
- Connection pooling

### 3. Authentication Patterns
- Provider-based auth
- Role-based access
- JWT session management
- Type-safe implementations

### 4. Development Patterns
- Progressive typing
- Modular code organization
- Clear documentation
- Performance optimization
