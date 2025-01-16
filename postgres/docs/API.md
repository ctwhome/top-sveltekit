# API Documentation

## Authentication Endpoints

### User Authentication

#### POST `/api/register`
Register a new user.
```typescript
Request:
{
  email: string;
  password: string;
  name?: string;
}

Response:
{
  id: string;
  email: string;
  name?: string;
}
```

#### POST `/api/user/password`
Update user password.
```typescript
Request:
{
  currentPassword: string;
  newPassword: string;
}

Response:
{
  success: boolean;
  message: string;
}
```

#### POST `/api/user/api-key`
Generate or retrieve API key.
```typescript
Response:
{
  apiKey: string;
}
```

### Admin Endpoints

#### GET `/api/admin/users`
List all users (requires admin role).
```typescript
Response:
{
  users: Array<{
    id: string;
    email: string;
    name?: string;
    roles: string[];
  }>;
}
```

#### PUT `/api/admin/users/[userId]/roles`
Update user roles (requires admin role).
```typescript
Request:
{
  roles: string[];
}

Response:
{
  success: boolean;
  message: string;
}
```

## Todo Endpoints

#### GET `/api/todos`
Get all todos for the authenticated user.
```typescript
Response:
{
  todos: Array<{
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
  }>;
}
```

#### POST `/api/todos`
Create a new todo.
```typescript
Request:
{
  title: string;
}

Response:
{
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}
```

#### PUT `/api/todos/[id]`
Update a todo.
```typescript
Request:
{
  title?: string;
  completed?: boolean;
}

Response:
{
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}
```

#### DELETE `/api/todos/[id]`
Delete a todo.
```typescript
Response:
{
  success: boolean;
  message: string;
}
```

## Email Endpoints

#### POST `/api/sendEmail`
Send an email (requires authentication).
```typescript
Request:
{
  to: string;
  subject: string;
  body: string;
}

Response:
{
  success: boolean;
  message: string;
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```typescript
{
  error: string;
  message: string;
}
```

### 401 Unauthorized
```typescript
{
  error: "Unauthorized";
  message: string;
}
```

### 403 Forbidden
```typescript
{
  error: "Forbidden";
  message: string;
}
```

### 500 Internal Server Error
```typescript
{
  error: "Internal Server Error";
  message: string;
}
