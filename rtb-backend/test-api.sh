#!/bin/bash
# test-api.sh - Script to test RTB Backend API endpoints

BASE_URL="http://localhost:5000"
TOKEN=""

echo "🧪 RTB Backend API Testing Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s "${BASE_URL}/" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start it with 'npm run dev'${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "TEST 1: Register User"
echo "=================================="
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "1234567890",
    "gender": "Male"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "Token: $TOKEN"
else
    echo -e "${YELLOW}⚠️  Registration failed (user may already exist)${NC}"
    echo ""
    echo "Trying to login instead..."
    LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "emailOrUsername": "test@example.com",
        "password": "password123"
      }')
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    echo "Token: $TOKEN"
fi

echo ""
echo "=================================="
echo "TEST 2: Login User"
echo "=================================="
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
fi

echo ""
echo "=================================="
echo "TEST 3: Get Profile (Protected Route)"
echo "=================================="
PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFILE_RESPONSE" | jq '.'

if echo "$PROFILE_RESPONSE" | grep -q "user"; then
    echo -e "${GREEN}✅ Get profile successful${NC}"
else
    echo -e "${RED}❌ Get profile failed${NC}"
fi

echo ""
echo "=================================="
echo "TEST 4: Update Profile"
echo "=================================="
UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User Updated",
    "phoneNumber": "9999999999"
  }')

echo "$UPDATE_RESPONSE" | jq '.'

if echo "$UPDATE_RESPONSE" | grep -q "updated successfully"; then
    echo -e "${GREEN}✅ Update profile successful${NC}"
else
    echo -e "${RED}❌ Update profile failed${NC}"
fi

echo ""
echo "=================================="
echo "TEST 5: Change Password"
echo "=================================="
CHANGE_PASSWORD_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/profile/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }')

echo "$CHANGE_PASSWORD_RESPONSE" | jq '.'

if echo "$CHANGE_PASSWORD_RESPONSE" | grep -q "changed successfully"; then
    echo -e "${GREEN}✅ Change password successful${NC}"
    
    # Change password back
    echo ""
    echo "Changing password back to original..."
    curl -s -X PUT "${BASE_URL}/api/profile/password" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "currentPassword": "newpassword123",
        "newPassword": "password123"
      }' > /dev/null
else
    echo -e "${RED}❌ Change password failed${NC}"
fi

echo ""
echo "=================================="
echo "TEST 6: Forgot Password"
echo "=================================="
FORGOT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }')

echo "$FORGOT_RESPONSE" | jq '.'

if echo "$FORGOT_RESPONSE" | grep -q "reset link"; then
    echo -e "${GREEN}✅ Forgot password request successful${NC}"
else
    echo -e "${RED}❌ Forgot password request failed${NC}"
fi

echo ""
echo "=================================="
echo "TEST 7: Access Protected Route Without Token"
echo "=================================="
NO_TOKEN_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile")

echo "$NO_TOKEN_RESPONSE" | jq '.'

if echo "$NO_TOKEN_RESPONSE" | grep -q "No token provided"; then
    echo -e "${GREEN}✅ Correctly rejected request without token${NC}"
else
    echo -e "${RED}❌ Should have rejected request without token${NC}"
fi

echo ""
echo "=================================="
echo "TEST 8: Access Protected Route With Invalid Token"
echo "=================================="
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/profile" \
  -H "Authorization: Bearer invalid_token_here")

echo "$INVALID_TOKEN_RESPONSE" | jq '.'

if echo "$INVALID_TOKEN_RESPONSE" | grep -q "Invalid"; then
    echo -e "${GREEN}✅ Correctly rejected invalid token${NC}"
else
    echo -e "${RED}❌ Should have rejected invalid token${NC}"
fi

echo ""
echo "=================================="
echo "TEST 9: Validation - Invalid Email"
echo "=================================="
INVALID_EMAIL_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Invalid User",
    "username": "invaliduser",
    "email": "not-an-email",
    "password": "password123",
    "phoneNumber": "1234567890"
  }')

echo "$INVALID_EMAIL_RESPONSE" | jq '.'

if echo "$INVALID_EMAIL_RESPONSE" | grep -q "Validation failed"; then
    echo -e "${GREEN}✅ Correctly validated email${NC}"
else
    echo -e "${RED}❌ Should have rejected invalid email${NC}"
fi

echo ""
echo "=================================="
echo "TEST 10: Validation - Short Password"
echo "=================================="
SHORT_PASSWORD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "123",
    "phoneNumber": "1234567890"
  }')

echo "$SHORT_PASSWORD_RESPONSE" | jq '.'

if echo "$SHORT_PASSWORD_RESPONSE" | grep -q "at least 6"; then
    echo -e "${GREEN}✅ Correctly validated password length${NC}"
else
    echo -e "${RED}❌ Should have rejected short password${NC}"
fi

echo ""
echo "=================================="
echo "✅ Testing Complete!"
echo "=================================="
echo ""
echo "Summary:"
echo "- All authentication endpoints tested"
echo "- All profile endpoints tested"
echo "- Validation tested"
echo "- Authorization tested"
echo ""
echo "Your token for manual testing: $TOKEN"
echo ""
echo "You can use this token to test other endpoints manually:"
echo "curl -X GET ${BASE_URL}/api/profile -H \"Authorization: Bearer $TOKEN\""
