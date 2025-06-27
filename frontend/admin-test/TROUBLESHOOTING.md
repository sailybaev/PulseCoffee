# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. 401 Unauthorized on /auth/refresh

This is expected behavior when:
- No valid refresh token exists in cookies
- The user hasn't logged in yet
- The refresh token has expired

**Solution**: This is normal - just proceed to login with valid credentials.

### 2. CORS Issues

If you see CORS errors, ensure:

1. **Backend CORS Configuration**: The backend should allow requests from `http://localhost:3001`
2. **Credentials**: Make sure `withCredentials: true` is set in API calls
3. **Headers**: Proper CORS headers are configured

### 3. Client-Side Exception

**Error**: "Application error: a client-side exception has occurred"

**Causes**:
- Missing React types (should be fixed with proper package.json)
- localStorage access during SSR
- API calls during server rendering

**Solutions**:
1. Ensure dependencies are installed: `npm install`
2. Use `typeof window !== 'undefined'` checks for browser-only code
3. Handle auth state properly

### 4. Authentication Flow

**Expected Flow**:
1. Frontend starts → tries refresh → gets 401 (expected)
2. User sees login form
3. User enters credentials → login succeeds
4. Token stored in localStorage + httpOnly cookie
5. Subsequent requests use Bearer token

### 5. Backend Requirements

Ensure your backend has:

```javascript
// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}))

// Cookie parser
app.use(cookieParser())
```

### 6. Testing Authentication

**Default Admin Credentials**:
- Phone: `+77777777777`
- Password: `admin123`

**Test Steps**:
1. Start backend server: `npm run start:dev` (port 3000)
2. Start frontend: `npm run dev` (port 3001)
3. Go to http://localhost:3001
4. Click "Admin Login" tab
5. Enter admin credentials
6. Should redirect to dashboard

### 7. Network Tab Debugging

**Check Network Tab**:
1. `POST /api/auth/refresh` → 401 (expected on first load)
2. `POST /api/auth/login` → 200 with accessToken
3. `GET /api/products` → 200 with Bearer token

### 8. Common Fixes

**Clear Browser Data**:
```javascript
// In browser console
localStorage.clear()
// Then refresh page
```

**Restart Both Servers**:
```bash
# Backend
cd backend && npm run start:dev

# Frontend (new terminal)
cd frontend/admin-test && npm run dev
```

**Check Backend Health**:
```bash
curl http://localhost:3000/api/health
# Should return 200 OK
```

### 9. Environment Setup

Ensure `.env.local` exists:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### 10. Dependencies Check

**Missing Dependencies**:
```bash
cd frontend/admin-test
npm install
# Should install all required packages
```

**TypeScript Errors**:
- Are expected until dependencies are installed
- Should resolve after `npm install`

## Still Having Issues?

1. **Check Backend Logs**: Look for CORS or authentication errors
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Verify request/response flow
4. **Try Direct Backend**: Test auth at http://localhost:3000/api/auth/login directly

## Quick Reset

```bash
# Complete reset
cd frontend/admin-test
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**Remember**: The 401 on refresh is normal and expected when not logged in!
