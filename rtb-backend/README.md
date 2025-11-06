# RTB Backend - Authentication & Profile Management

## 🚀 Features Implemented

### Authentication

- ✅ User Registration with validation
- ✅ User Login (supports email or username)
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Forgot Password with email
- ✅ Reset Password with token
- ✅ Role-based access control

### Profile Management

- ✅ Get user profile
- ✅ Update profile information
- ✅ Change password
- ✅ Upload profile picture
- ✅ Delete profile picture

## 📁 Project Structure

```
src/
├── controllers/
│   ├── auth.controller.ts      # Authentication logic
│   └── profile.controller.ts   # Profile management logic
├── dtos/
│   ├── auth.dto.ts             # Authentication DTOs
│   └── profile.dto.ts          # Profile DTOs
├── entities/
│   └── User.ts                 # User entity
├── middlewares/
│   ├── auth.middleware.ts      # JWT authentication & authorization
│   └── upload.middleware.ts    # File upload configuration
├── routes/
│   ├── auth.routes.ts          # Authentication routes
│   └── profile.routes.ts       # Profile routes
├── utils/
│   ├── jwt.util.ts             # JWT token utilities
│   ├── password.util.ts        # Password hashing utilities
│   ├── email.util.ts           # Email sending utilities
│   └── validator.util.ts       # DTO validation utilities
├── data-source.ts              # TypeORM configuration
└── index.ts                    # Main application entry point
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the values in `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rtb_database

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@rtb.com

# Frontend
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 2. Database Setup

Make sure PostgreSQL is running and create the database:

```bash
createdb rtb_database
```

### 3. Install Dependencies

Already done! All dependencies are installed.

### 4. Run the Application

Development mode with auto-reload:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "gender": "Male" (optional)
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "school",
    "gender": "Male",
    "profilePicture": null
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "john@example.com",  // or "johndoe"
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### 3. Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200 OK
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### 4. Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

### Profile Routes (`/api/profile`)

**Note:** All profile routes require authentication. Include the JWT token in the header:

```
Authorization: Bearer <your_jwt_token>
```

#### 1. Get Profile

```http
GET /api/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "school",
    "gender": "Male",
    "profilePicture": "uploads/profiles/image.jpg",
    "createdAt": "2025-11-06T...",
    "updatedAt": "2025-11-06T..."
  }
}
```

#### 2. Update Profile

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "phoneNumber": "9876543210",
  "gender": "Male"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### 3. Change Password

```http
PUT /api/profile/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

#### 4. Upload Profile Picture

```http
POST /api/profile/picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- profilePicture: [image file]

Response: 200 OK
{
  "message": "Profile picture uploaded successfully",
  "profilePicture": "uploads/profiles/123456789-image.jpg"
}
```

#### 5. Delete Profile Picture

```http
DELETE /api/profile/picture
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Profile picture deleted successfully"
}
```

## 🔐 User Roles

The system supports the following roles:

- `school` (default for new registrations)
- `admin`
- `technician`
- `rtb-staff`

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Token expiration (7 days default)
- ✅ Role-based authorization middleware
- ✅ Input validation with class-validator
- ✅ File upload restrictions (images only, 5MB max)
- ✅ Email enumeration prevention

## 📝 Testing with cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Next Steps

To use this authentication system in your app:

1. Make sure PostgreSQL is running
2. Update your `.env` file with correct database credentials
3. Run `npm run dev` to start the server
4. Test the endpoints using Postman, cURL, or your frontend

## 📚 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
