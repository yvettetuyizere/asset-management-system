# Quick Start Guide - RTB Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values (minimal required):

```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rtb_database
JWT_SECRET=your_super_secret_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Step 2: Create Database

```bash
# Make sure PostgreSQL is running
# Create the database
createdb rtb_database

# Or using psql
psql -U postgres
CREATE DATABASE rtb_database;
\q
```

### Step 3: Run the Server

```bash
# Development mode (with auto-reload)
npm run dev
```

The server will start on `http://localhost:5000`

### Step 4: Test the API

#### Option 1: Using cURL

**Register a user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

**Get Profile:**

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Option 2: Using Postman

1. Import `postman_collection.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:5000`
3. Register a user
4. Copy the token from the response
5. Set the `token` variable in Postman
6. Test other endpoints!

### Step 5: Verify Database

Check if the user was created:

```bash
psql -U postgres rtb_database
SELECT * FROM users;
\q
```

## 🎯 What's Working

- ✅ User Registration
- ✅ User Login (with email or username)
- ✅ JWT Authentication
- ✅ Get/Update Profile
- ✅ Change Password
- ✅ Upload/Delete Profile Picture
- ✅ Forgot/Reset Password
- ✅ Role-based Access Control

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run typeorm` - Run TypeORM CLI

## 🔍 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solution:** Make sure PostgreSQL is running:

```bash
sudo service postgresql start  # Linux
brew services start postgresql # macOS
```

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:** Change the PORT in `.env` or kill the process using port 5000

### JWT Token Error

```
Error: secretOrPrivateKey must have a value
```

**Solution:** Make sure `JWT_SECRET` is set in your `.env` file

## 🎓 Next Steps

1. **Add More Entities:** Create Device, School, IssueReport entities
2. **Add More Routes:** Implement device management, reports, etc.
3. **Add Validation:** Enhance validation rules
4. **Add Tests:** Write unit and integration tests
5. **Deploy:** Deploy to production server

## 📚 Documentation

See `README.md` for complete API documentation.
