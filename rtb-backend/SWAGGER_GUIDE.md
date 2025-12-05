# Swagger API Documentation

## Overview

The RTB Asset Management System API now includes comprehensive Swagger/OpenAPI documentation with an interactive UI for testing endpoints.

## Accessing Swagger UI

Once the server is running, access the Swagger documentation at:

```
http://localhost:5000/api-docs
```

## Features

### Interactive API Testing
- **Try it out**: Click the "Try it out" button on any endpoint to test it directly from the browser
- **Request/Response visualization**: See formatted request and response payloads
- **Authentication**: Bearer token authentication is pre-configured for protected endpoints

### Comprehensive Documentation
- **Endpoint descriptions**: Each endpoint includes purpose, parameters, and expected responses
- **Request/Response schemas**: All request and response bodies are fully documented
- **Error handling**: Common error responses are documented with status codes

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and receive JWT token
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

#### Profile Endpoints (Requires Authentication)
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change user password
- `POST /api/profile/picture` - Upload profile picture
- `DELETE /api/profile/picture` - Delete profile picture

## Using the Swagger UI

### 1. Register a New User
1. Navigate to the "Authentication" section
2. Click on `POST /api/auth/register`
3. Click "Try it out"
4. Fill in the request body with:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "staff",
  "department": "IT"
}
```
5. Click "Execute" to see the response

### 2. Login
1. Click on `POST /api/auth/login`
2. Click "Try it out"
3. Fill in the request body with:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
4. Click "Execute" and copy the JWT token from the response

### 3. Using Protected Endpoints
1. Click the "Authorize" button at the top of the page
2. Paste the JWT token in the format: `Bearer <your_token>`
3. Click "Authorize"
4. Now you can test protected endpoints like `GET /api/profile`

### 4. Get User Profile
1. Ensure you're authorized (see step 3 above)
2. Click on `GET /api/profile`
3. Click "Try it out"
4. Click "Execute" to retrieve your profile

### 5. Update Profile
1. Click on `PUT /api/profile`
2. Click "Try it out"
3. Fill in the request body:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+9876543210",
  "department": "HR"
}
```
4. Click "Execute"

### 6. Upload Profile Picture
1. Click on `POST /api/profile/picture`
2. Click "Try it out"
3. Click "Select File" and choose an image (JPEG, PNG, or GIF)
4. Click "Execute"

### 7. Change Password
1. Click on `PUT /api/profile/password`
2. Click "Try it out"
3. Fill in the request body:
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```
4. Click "Execute"

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "message": "Error description",
  "status": 400
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Create a new account via `/api/auth/register`
2. **Login**: Authenticate via `/api/auth/login` to receive a JWT token
3. **Protected Endpoints**: Include the token in the Authorization header:
   ```
   Authorization: Bearer <jwt_token>
   ```

## Swagger JSON Specification

The OpenAPI/Swagger specification is available at:

```
http://localhost:5000/api-docs.json
```

This can be used to:
- Generate client SDKs
- Import into API testing tools (Postman, Insomnia, etc.)
- Integrate with other development tools

## Server Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API health check |
| `GET /api-docs` | Interactive Swagger UI |
| `GET /api-docs.json` | OpenAPI specification in JSON format |

## Environment Variables

Configure your API base URL in the `.env` file:

```
API_URL=http://localhost:5000
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## Development

To run the API in development mode with automatic recompilation:

```bash
npm run dev
```

The Swagger UI will be available immediately at `http://localhost:5000/api-docs`

## Building

To build the project for production:

```bash
npm run build
npm start
```

The compiled JavaScript will be in the `dist/` directory.
