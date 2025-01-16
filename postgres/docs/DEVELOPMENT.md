# Development Guide

## Development Environment

### Starting the Development Server

Run the development server:
```bash
bun dev
```

The server will start at [http://localhost:5173](http://localhost:5173)

### Project Structure

```
├── src/
│   ├── lib/            # Shared components and utilities
│   │   ├── components/ # Reusable UI components
│   │   ├── stores/     # Svelte stores
│   │   ├── utils/      # Utility functions
│   │   └── types/      # TypeScript types
│   ├── routes/         # SvelteKit routes
│   └── app.d.ts        # TypeScript declarations
├── static/             # Static assets
├── docs/              # Documentation
└── migrations/        # Database migrations
```

## Development Guidelines

### Component Development

1. **UI Components**
   - Use DaisyUI for styling
   - Keep components focused and reusable
   - Separate UI logic from data management

2. **Store Management**
   - Keep database logic in stores, not components
   - Use stores for shared state management
   - Implement store functionality in separate files if complex

3. **TypeScript Usage**
   - Focus on functionality first
   - Add types progressively
   - Fix TypeScript errors after completing features

### Icons Usage

The project uses unplugin-icons package for SVG icons:
- Prefer Lucide icons when available
- No need to install the package (auto-configured)
- Import icons directly in components

## Updating Your Fork

### Initial Setup

1. Add the original repository as a remote:
```bash
git remote add upstream git://github.com/ctwhome/top-sveltekit.git
```

2. Fetch the upstream repository:
```bash
git fetch upstream
```

### Keeping Updated

Update your fork with upstream changes:
```bash
git pull upstream main
```

## Building for Production

1. Build the application:
```bash
bun build
```

2. Preview the production build:
```bash
bun preview
```

## Best Practices

### Code Organization
- Keep components small and focused
- Use meaningful file and directory names
- Follow the established project structure

### State Management
- Use Svelte stores for shared state
- Keep store logic separate from components
- Implement complex logic in dedicated files

### Performance
- Lazy load components when possible
- Optimize images and assets
- Use proper caching strategies

### Testing
- Write tests for critical functionality
- Test components in isolation
- Verify changes don't break existing features

## Troubleshooting

Common development issues and solutions:

1. **Build Errors**
   - Clear the .svelte-kit cache
   - Verify dependency versions
   - Check for TypeScript errors

2. **Runtime Issues**
   - Check browser console
   - Verify environment variables
   - Review server logs

3. **Database Problems**
   - Ensure migrations are up to date
   - Check connection settings
   - Verify data integrity
