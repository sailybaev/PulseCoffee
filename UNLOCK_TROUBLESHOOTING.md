# Troubleshooting Device Unlock at http://localhost:4321/?branch=UDP

## Summary
The backend admin unlock endpoint is working correctly. The issue is likely in the frontend application not displaying the admin unlock panel properly or a device ID mismatch.

## Backend Status ✅
- Admin unlock endpoint: `POST /api/admin/unlock` - **WORKING**
- Device registration: `POST /api/devices/register` - **WORKING**
- Branch validation: `POST /api/branches-public/UDP/validate` - **WORKING**
- Default admin password: `admin123` (can be changed via `ADMIN_UNLOCK_PASSWORD` env var)

## Troubleshooting Steps

### Step 1: Verify Backend Connectivity
Test the admin unlock endpoint directly:
```bash
curl -X POST http://localhost:3000/api/admin/unlock \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123", "deviceId": "test-device"}'
```
Expected response: `{"success":true,"message":"Device unlocked successfully"}`

### Step 2: Check Frontend Application State
When visiting `http://localhost:4321/?branch=UDP`, the frontend should:

1. **Parse the URL parameter**: Extract `branch=UDP`
2. **Validate the branch**: Call `/api/branches-public/UDP/validate`
3. **Register the device**: Call `/api/devices/register`
4. **Store configuration**: Save branch and device ID in localStorage
5. **Show main application**: Or show error screen with admin unlock option

### Step 3: Debug the Frontend Flow
Open the browser developer console (F12) when visiting `http://localhost:4321/?branch=UDP` and check for:

- **Network errors**: Failed API calls to backend
- **JavaScript errors**: Issues in the BranchGuard component
- **Device ID generation**: Check localStorage for stored device ID

### Step 4: Manually Check Device Registration
If the device was registered, find the device ID:
```bash
# Check browser localStorage at http://localhost:4321
# Look for keys like 'DEVICE_ID', 'TABLET_BRANCH_ID'
```

### Step 5: Force Admin Unlock
Use the testing tools provided:

1. **Test pages**: Visit `http://localhost:3000/public/tablet-simulator.html`
2. **Manual unlock**: Use the admin unlock test form
3. **Device registration**: Follow the complete flow simulation

## Common Issues & Solutions

### Issue 1: Admin Panel Not Visible
**Symptom**: No admin unlock panel appears
**Solution**: 
- Check BranchGuard component is rendering error state
- Verify the error condition triggers admin panel display
- Check CSS styling isn't hiding the admin panel

### Issue 2: Wrong Device ID
**Symptom**: Admin unlock returns success but device stays locked
**Solution**:
- Use browser dev tools to find the actual device ID in localStorage
- Use that specific device ID in the unlock request

### Issue 3: Network/CORS Issues
**Symptom**: API calls fail from frontend
**Solution**:
- Verify backend is running on port 3000
- Check CORS configuration allows localhost:4321
- Test API calls manually with curl

### Issue 4: Environment Configuration
**Symptom**: Wrong admin password
**Solution**:
```bash
# Set custom admin password (optional)
export ADMIN_UNLOCK_PASSWORD="your-custom-password"
# Restart backend server
cd backend && npm run start:dev
```

## Quick Fix Commands

```bash
# 1. Restart both servers
cd backend && npm run start:dev &
cd frontend/pulse-tablet && npm run dev &

# 2. Clear browser storage
# Open http://localhost:4321 and clear localStorage

# 3. Test unlock with known device ID
curl -X POST http://localhost:3000/api/admin/unlock \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123", "deviceId": "ACTUAL_DEVICE_ID"}'
```

## Debug Tools Available

1. **Tablet Simulator**: `http://localhost:3000/public/tablet-simulator.html`
   - Complete branch setup simulation
   - Admin unlock testing
   - Backend connectivity tests

2. **Branch Test Page**: `http://localhost:3000/public/branch-test.html`
   - Full branch system testing
   - Device registration and validation

3. **Simple Unlock Test**: `http://localhost:3000/public/unlock-test.html`
   - Direct admin unlock testing

## Next Steps

1. Visit the tablet simulator page and run through the complete flow
2. Check the browser console for any errors when visiting the actual URL
3. Use the device ID shown in the simulator for manual unlock testing
4. If still not working, check the BranchGuard component rendering logic

The backend is working correctly - the issue is likely in the frontend application state or display logic.
