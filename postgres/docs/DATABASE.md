# Database Documentation

## Overview
This project uses PostgreSQL as its primary database, with node-pg-migrate for database migrations. The database structure supports authentication, user management, and application-specific data.

## Migration System

### Migration Format
- Uses a simplified three-digit numbering format (001, 002, etc.)
- SQL-based migrations for maximum flexibility
- Located in the `migrations/` directory

## Database Schema

### Core Tables

1. **users**
   - Stores user information
   - Handles authentication data
   - Manages user roles

2. **roles**
   - Defines available roles
   - Default roles: admin, user

3. **user_roles**
   - Maps users to roles
   - Supports multiple roles per user

### Migration Templates

See `migrations/000_template.sql` for migration file template and best practices.

## Connection Management

The database connection is managed through:
- Development: `.env` file
- Production: Environment variables
- Connection pooling for optimal performance

## Best Practices

1. **Migrations**
   - Always test migrations locally first
   - Include both up and down migrations
   - Keep migrations atomic and focused

2. **Queries**
   - Use parameterized queries to prevent SQL injection
   - Implement proper error handling
   - Use transactions where appropriate

3. **Performance**
   - Index frequently queried columns
   - Monitor query performance
   - Optimize large queries

## Example Queries

### User Management
```sql
-- Get user with roles
SELECT u.*, array_agg(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id;

-- Add role to user
INSERT INTO user_roles (user_id, role_id)
VALUES ($1, $2);
```

### Data Operations
```sql
-- Example todo operations
SELECT * FROM todos WHERE user_id = $1;
INSERT INTO todos (title, user_id) VALUES ($1, $2);
```

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure proper SSL configuration

2. **Migration Failures**
   - Review migration logs
   - Check for dependency conflicts
   - Verify SQL syntax

3. **Performance Problems**
   - Analyze query plans
   - Review index usage
   - Check connection pool settings
