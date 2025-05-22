@echo off
echo Running authentication debug utilities...

set BASE_URL=http://localhost:8081

echo.
echo 1. Checking server status...
curl -s %BASE_URL%/api/auth/test

echo.
echo 2. Creating test user...
curl -s -X POST %BASE_URL%/api/auth/create-test-user

echo.
echo 3. Testing authentication with test user...
curl -s -X POST %BASE_URL%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\", \"password\":\"password123\"}"

echo.
echo 4. Testing a protected endpoint (this should fail without a token)...
curl -s %BASE_URL%/api/policies/user

echo.
echo Debug complete! If login succeeded, you should see a token in the response above.
echo Use that token to make authenticated requests like this:
echo curl -H "Authorization: Bearer YOUR_TOKEN_HERE" %BASE_URL%/api/policies/user
echo. 