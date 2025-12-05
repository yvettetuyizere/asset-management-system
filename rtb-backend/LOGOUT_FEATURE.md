# Logout Feature Documentation

## Overview

The logout feature has been implemented to securely revoke user authentication tokens on the backend. When a user logs out, their JWT token is added to a blacklist, preventing any further use of that token.

## How It Works

### Token Blacklist System
- **In-Memory Storage**: Tokens are stored in memory with their expiration times
- **Automatic Cleanup**: Expired tokens are automatically removed from the blacklist when checked
- **Stateless Validation**: The middleware checks if a token is blacklisted before allowing access

### Logout Flow
1. User makes a logout request with their JWT token in the Authorization header
2. Backend validates the token is authentic
3. Token is added to the blacklist with its expiration timestamp
4. Client-side should clear the stored token
5. Any subsequent requests with that token will be rejected

## API Endpoint

### POST /api/auth/logout

**Authentication Required**: Yes (Bearer Token)

**Description**: Logout the authenticated user and revoke their token

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**: None required (the token is read from the Authorization header)

**Response (Success - 200)**:
```json
{
  "message": "Logout successful",
  "success": true
}
```

**Response (Error - 401)**:
```json
{
  "message": "Invalid or expired token"
}
```

## Testing in Swagger UI

### Step 1: Login First
1. Navigate to `http://localhost:5000/api-docs`
2. Click on `POST /api/auth/login`
3. Fill in credentials:
```json
{
  "emailOrUsername": "johndoe",
  "password": "password123"
}
```
4. Copy the JWT token from the response

### Step 2: Authorize in Swagger
1. Click the blue "Authorize" button at the top
2. In the modal, paste the token in this format: `Bearer <your_token>`
3. Click "Authorize"

### Step 3: Test Logout
1. Find `POST /api/auth/logout` endpoint
2. Click "Try it out"
3. Click "Execute"
4. You should see a 200 response with `"success": true`

### Step 4: Verify Token is Blacklisted
1. Try to access a protected endpoint like `GET /api/profile`
2. You should get a 401 error: "Token has been revoked. Please login again."

## Frontend Implementation

### React/TypeScript Example

```typescript
// Logout function
const logout = async (token: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message); // "Logout successful"
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## Security Considerations

### Current Implementation
- ✅ Token validation before blacklisting
- ✅ Automatic cleanup of expired tokens
- ✅ Prevents token reuse after logout
- ✅ Frontend should remove token from storage

### For Production
Consider implementing:
1. **Redis-Based Blacklist**: For distributed systems
   ```typescript
   // Example with Redis
   const redis = new Redis();
   
   addToBlacklist(token, expiresAt) {
     redis.setex(`blacklist:${token}`, expiresAt - Math.floor(Date.now() / 1000), '1');
   }
   
   isBlacklisted(token) {
     return redis.exists(`blacklist:${token}`);
   }
   ```

2. **Database Persistence**: Store revoked tokens in database

3. **Token Versioning**: Increment user's token version on logout

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│                  USER LIFECYCLE                      │
└─────────────────────────────────────────────────────┘
          │
          ▼
    ┌──────────────┐
    │  REGISTER    │ ──→ Create account & get token
    └──────────────┘
          │
          ▼
    ┌──────────────┐
    │    LOGIN     │ ──→ Authenticate & get JWT
    └──────────────┘
          │
          ▼
    ┌──────────────┐
    │ USE API      │ ──→ Include token in requests
    │ WITH TOKEN   │
    └──────────────┘
          │
          ▼
    ┌──────────────┐
    │   LOGOUT     │ ──→ Add token to blacklist
    └──────────────┘
          │
          ▼
    ┌──────────────┐
    │ TOKEN        │ ──→ Requests rejected
    │ BLACKLISTED  │
    └──────────────┘
```

## Endpoints Overview

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Authenticate user |
| POST | `/api/auth/logout` | **Yes** | Revoke token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/profile` | **Yes** | Get user profile |
| PUT | `/api/profile` | **Yes** | Update profile |
| PUT | `/api/profile/password` | **Yes** | Change password |

## Error Handling

### Common Logout Errors

| Status | Error | Solution |
|--------|-------|----------|
| 401 | "No token provided" | Include Authorization header with token |
| 401 | "Invalid or expired token" | Token is invalid or already expired; login again |
| 401 | "Token has been revoked" | User already logged out; login again |
| 500 | "Internal server error" | Server error; check logs |

## Monitoring

You can check the blacklist size using the utility function:

```typescript
import { tokenBlacklist } from './utils/tokenBlacklist.util';

// Get current blacklist size
const size = tokenBlacklist.getSize();
console.log(`Tokens in blacklist: ${size}`);
```

## Future Enhancements

1. **Logout All Devices**: Add endpoint to blacklist all user tokens
2. **Logout Analytics**: Track logout events for security analysis
3. **Session Management**: Add session table to database
4. **Token Refresh**: Implement refresh token rotation
5. **Device Tracking**: Track devices and allow remote logout
