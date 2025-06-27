# Barista App - Quick Start & Troubleshooting

## 🔧 API Endpoint Fix Applied

**Issue**: The barista app was trying to access `/orders/branch/:branchId` but the backend expected `/orders/branch?branch=:branchId`

**Solution**: 
1. ✅ Fixed frontend to use correct query parameter format
2. ✅ Added fallback endpoint in backend (`/orders/branch/:branchId`) for better compatibility
3. ✅ Added comprehensive error handling and API testing tools

## 🚀 Starting the Application

### Backend (Required First)
```bash
cd backend
npm run start:dev
```
**OR** use VS Code task: "Start Backend Server"

### Barista App  
```bash
cd frontend/barista-app
npm run dev
```
**OR** use VS Code task: "Start Barista App"

## 🌐 Access URLs

- **Development**: http://localhost:3002
- **With Branch Setup**: http://localhost:3002?branch=YOUR_BRANCH_ID

## 🔍 Troubleshooting the 404 Error

### Step 1: Verify Backend is Running
```bash
curl http://localhost:3000/api/orders/branch?branch=81a0bc8c-94b6-43d0-9496-1832ba5fb36d
```

### Step 2: Check Authentication
The barista app requires:
1. Valid user account with BARISTA or ADMIN role
2. Authentication token in localStorage
3. Branch ID configured

### Step 3: Use Built-in API Tester
1. Open barista app
2. If you see an error screen, click "Show API Test"
3. Test different endpoints to identify the issue

### Step 4: Check Branch ID
Ensure the branch ID `81a0bc8c-94b6-43d0-9496-1832ba5fb36d` exists in your database:
```sql
SELECT * FROM Branch WHERE id = '81a0bc8c-94b6-43d0-9496-1832ba5fb36d';
```

## 🛠️ Manual Testing

### Test Backend Endpoint Directly
```bash
# Test public endpoint (no auth required)
curl "http://localhost:3000/api/orders/branch?branch=81a0bc8c-94b6-43d0-9496-1832ba5fb36d"

# Test authenticated endpoint (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/api/orders/branch/81a0bc8c-94b6-43d0-9496-1832ba5fb36d"
```

### Create Test Branch (if needed)
```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Branch",
    "address": "123 Test St",
    "isActive": true
  }'
```

## 🔐 Authentication Setup

1. **Create Barista User** (if needed):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+77777777777",
    "password": "password123",
    "name": "Test Barista",
    "role": "BARISTA"
  }'
```

2. **Login to Get Token**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+77777777777",
    "password": "password123"
  }'
```

## 📱 App Features Verification

### ✅ Real-time Updates
- WebSocket connection shows in browser dev tools
- New orders appear instantly
- Status updates propagate in real-time

### ✅ Sound Notifications  
- Click notification bell (🔔) to enable audio
- Different sounds for new orders, updates, completion

### ✅ URL-based Branch Setup
- Use `?branch=BRANCH_ID` parameter
- Device auto-registers with backend
- Branch info persists in localStorage

### ✅ Order Management
- View orders by status (Pending, Confirmed, Preparing, Ready, Completed)
- Update order status with one click
- Cancel orders when appropriate

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on `/orders/branch/:id` | Backend not running or endpoint mismatch |
| WebSocket connection failed | Check CORS settings and backend WebSocket support |
| Audio not playing | Click notification bell, check browser permissions |
| Branch setup fails | Verify branch exists and is active |
| Authentication errors | Check user role (must be BARISTA/ADMIN) |

## 📋 Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Barista app running on port 3002  
- [ ] Valid branch ID exists in database
- [ ] Barista user account created
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] WebSocket connection established
- [ ] Audio notifications enabled

## 🚨 Emergency Reset

If all else fails:
```bash
# Clear browser data
localStorage.clear();
sessionStorage.clear();

# Or use the "Reset App Data" button in error screen
```

The barista app now includes comprehensive error handling and API testing tools to help diagnose and resolve issues quickly!
