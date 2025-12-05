# Backend & Frontend Connection Guide

## ✅ Connection Status

Both services are running and connected:

| Service | URL | Status | Port |
|---------|-----|--------|------|
| **Backend** | http://localhost:5000 | ✅ Running | 5000 |
| **Frontend** | http://localhost:3000 | ✅ Running | 3000 |
| **CORS** | Configured | ✅ Enabled | - |
| **Database** | Neon PostgreSQL | ✅ Connected | Remote |

---

## 🚀 Quick Start

### Start Backend (Terminal 1)
```powershell
cd rtb-backend
npm install  # (if needed)
npm run dev
```

Expected output:
```
✅ Database connected successfully
🚀 Server is running on port 5000
```

### Start Frontend (Terminal 2)
```powershell
cd rtb-frontend
npm install  # (if needed)
npm run dev
```

Expected output:
```
✓ Ready in X.Xs
✓ Compiled /login in XXms
```

---

## 🔌 Connection Architecture

```
Frontend (Next.js + React)     Backend (Express + TypeORM)
     ↓                               ↓
  Port 3000                      Port 5000
     ↓                               ↓
  axios requests ← → CORS enabled ← Express
     ↓                               ↓
 localhost:3000                  localhost:5000
```

### Axios Configuration (Frontend)
- **Base URL**: `http://localhost:5000`
- **Endpoints**: `/api/auth/*`, `/api/profile/*`, etc.
- **CORS**: Allowed from `http://localhost:3000`

### Express Configuration (Backend)
- **CORS Origin**: `http://localhost:3000` (set in `.env`)
- **Auth Routes**: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-otp`
- **Profile Routes**: `/api/profile/*`

---

## 🔐 Login Flow with OTP

### Step 1: Credentials Verification
```
POST http://localhost:5000/api/auth/login
{
  "emailOrUsername": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to registered email. Please verify to complete login."
}
```

Backend actions:
- ✅ Validates credentials
- ✅ Generates OTP code (6 digits)
- ✅ Sends OTP to user's email
- ✅ Stores OTP in database with 5-minute expiry

### Step 2: OTP Verification
```
POST http://localhost:5000/api/auth/verify-otp
{
  "emailOrUsername": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login verified",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "user@example.com",
    "role": "school"
  }
}
```

Frontend actions:
- ✅ Stores token in `localStorage.setItem("token", response.data.token)`
- ✅ Redirects to `/dashboard`

---

## 📋 Testing the Connection

### Option 1: Using Frontend UI
1. Open http://localhost:3000/login
2. Enter credentials (email/username + password)
3. Click "Log In"
4. Wait for OTP email
5. Enter OTP code and click "Verify & Sign in"
6. Should redirect to dashboard with token stored

### Option 2: Using Backend Postman/cURL

#### Test Health Endpoint
```bash
GET http://localhost:5000/
```

#### Test Register
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "gender": "male"
}
```

#### Test Login (with OTP)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "test@example.com",
  "password": "password123"
}
```

#### Verify OTP
```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "emailOrUsername": "test@example.com",
  "otp": "123456"
}
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to http://localhost:5000"
**Solution:**
1. Verify backend is running: `npm run dev` in `rtb-backend`
2. Check port 5000 is not blocked: `netstat -ano | findstr :5000`
3. Check `.env` has `PORT=5000`

### Issue: "CORS error" in browser console
**Solution:**
1. Verify backend `.env` has: `CORS_ORIGIN=http://localhost:3000`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "OTP email not received"
**Solution:**
1. Check backend `.env` has correct Gmail credentials:
   - `MAIL_USER=your-email@gmail.com`
   - `MAIL_PASSWORD=your-app-password` (NOT your Gmail password!)
2. Use Gmail app-specific password (not regular password)
3. Check spam/junk folder
4. Check backend logs for email errors

### Issue: "Database connection failed"
**Solution:**
1. Verify `.env` has valid `DATABASE_URL`
2. Check internet connection (Neon is remote)
3. Verify IP is whitelisted on Neon dashboard
4. Restart backend: `npm run dev`

### Issue: Frontend showing blank page
**Solution:**
1. Clear `.next` folder: `rm -r .next`
2. Restart frontend: `npm run dev`
3. Check browser console for errors (F12)

---

## 📊 Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Long random string
- [ ] `MAIL_HOST` - smtp.gmail.com
- [ ] `MAIL_USER` - Your email
- [ ] `MAIL_PASSWORD` - App-specific password
- [ ] `CORS_ORIGIN` - http://localhost:3000
- [ ] `PORT` - 5000
- [ ] `NODE_ENV` - development

### Frontend
- No `.env` needed for local development
- Requests hardcoded to `http://localhost:5000`

---

## 🔄 Data Flow Summary

```
User fills login form
        ↓
[Frontend] Sends POST /api/auth/login
        ↓
[Backend] Validates credentials
        ↓
Backend generates OTP + sends email
        ↓
[Frontend] Shows OTP modal with countdown (5 min)
        ↓
User enters OTP
        ↓
[Frontend] Sends POST /api/auth/verify-otp
        ↓
[Backend] Verifies OTP (checks code, expiry, used flag)
        ↓
Backend returns JWT token + user data
        ↓
[Frontend] Saves token to localStorage
        ↓
[Frontend] Redirects to /dashboard
        ↓
✅ Logged In!
```

---

## 📱 Next Steps

1. **Test the full login flow** using the UI
2. **Create test users** via registration or database
3. **Monitor logs** in both terminals during testing
4. **Check localStorage** for token: Open DevTools → Application → LocalStorage
5. **Implement dashboard** features that use the token for API requests

---

## 🎯 API Endpoints Summary

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Step 1: Send credentials, get OTP |
| POST | `/api/auth/verify-otp` | Step 2: Verify OTP, get token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Profile Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/me` | Get current user profile (requires token) |
| PUT | `/api/profile/me` | Update current user profile |
| POST | `/api/profile/upload-picture` | Upload profile picture |

---

## 💾 Token Storage & Usage

### localStorage Usage
```javascript
// Store token after login
localStorage.setItem("token", response.data.token);

// Retrieve token
const token = localStorage.getItem("token");

// Use in API headers
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Clear on logout
localStorage.removeItem("token");
```

---

## 📞 Contact & Support

For issues:
1. Check the logs in both terminals
2. Review browser DevTools (F12) Network and Console tabs
3. Verify environment variables in `.env` files
4. Ensure both services are running

---

**Last Updated:** November 13, 2025
**Status:** ✅ Connected & Running
