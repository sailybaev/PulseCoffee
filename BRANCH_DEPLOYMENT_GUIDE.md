# Tablet Branch Configuration Guide

## Overview
This system automatically configures tablets for specific branches using URL-based initialization. Each tablet will be locked to a specific branch and can only process orders for that branch.

## Deployment Strategy

### 1. Branch URLs
Create branch-specific URLs for each tablet:

```
Branch 1 (Downtown): https://app.pulsecoffee.com?branch=downtown
Branch 2 (Mall): https://app.pulsecoffee.com?branch=mall  
Branch 3 (Airport): https://app.pulsecoffee.com?branch=airport
Branch 4 (University): https://app.pulsecoffee.com?branch=university
```

### 2. Tablet Setup Process

#### Step 1: Initial Configuration
1. Open Chrome/Safari on the tablet
2. Navigate to the branch-specific URL
3. The app will automatically:
   - Validate the branch ID with the backend
   - Register the device with the branch
   - Lock the configuration locally
   - Remove the branch parameter from the URL

#### Step 2: Create Bookmark/Shortcut
1. Bookmark the URL (after branch parameter is removed)
2. Or create a home screen shortcut
3. Set as the browser homepage (optional)

#### Step 3: Kiosk Mode (Recommended)
Enable kiosk mode to prevent users from navigating away:
- **iPad**: Use Guided Access (Settings > Accessibility > Guided Access)
- **Android**: Use a kiosk browser app
- **Windows**: Use Chrome's kiosk mode (`--kiosk --disable-pinch`)

## Backend Requirements

### 1. Branch Validation Endpoint
```typescript
// POST /api/branches/{branchId}/validate
app.post('/api/branches/:branchId/validate', async (req, res) => {
  const { branchId } = req.params;
  const { deviceInfo } = req.body;

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, isActive: true }
  });

  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  res.json({ valid: true, branch });
});
```

### 2. Device Registration Endpoint
```typescript
// POST /api/devices/register
app.post('/api/devices/register', async (req, res) => {
  const { deviceId, branchId, deviceInfo } = req.body;

  await prisma.device.upsert({
    where: { deviceId },
    update: { branchId, lastSeen: new Date(), deviceInfo },
    create: { deviceId, branchId, deviceInfo }
  });

  res.json({ success: true });
});
```

### 3. Branch-Specific Orders Endpoint
```typescript
// GET /api/orders/branch?branch=branchId&status=status
app.get('/api/orders/branch', async (req, res) => {
  const { branch, status } = req.query;

  const orders = await prisma.order.findMany({
    where: {
      branchId: branch,
      ...(status && { status })
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
});
```

### 4. Admin Unlock Endpoint
```typescript
// POST /api/admin/unlock
app.post('/api/admin/unlock', async (req, res) => {
  const { password, deviceId } = req.body;
  
  const validPassword = process.env.ADMIN_UNLOCK_PASSWORD || 'admin123';
  
  if (password !== validPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Log the unlock attempt
  await prisma.adminAction.create({
    data: {
      action: 'TABLET_UNLOCK',
      deviceId,
      timestamp: new Date()
    }
  });

  res.json({ success: true });
});
```

## Database Schema Updates

Add these tables to your Prisma schema:

```prisma
model Device {
  id          String   @id @default(cuid())
  deviceId    String   @unique
  branchId    String
  deviceInfo  Json?
  lastSeen    DateTime @default(now())
  createdAt   DateTime @default(now())
  
  branch      Branch   @relation(fields: [branchId], references: [id])
  
  @@map("devices")
}

model Branch {
  id        String   @id @default(cuid())
  name      String
  address   String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  devices   Device[]
  orders    Order[]
  
  @@map("branches")
}

model AdminAction {
  id        String   @id @default(cuid())
  action    String
  deviceId  String?
  timestamp DateTime @default(now())
  
  @@map("admin_actions")
}
```

## Security Features

### 1. Branch Validation
- Every tablet validates its branch assignment on startup
- Backend verifies branch exists and is active
- Invalid branches are rejected

### 2. Device Registration
- Each tablet gets a unique device ID
- Device info (screen resolution, user agent) is tracked
- Registration is logged for audit purposes

### 3. Admin Override
- Emergency unlock with admin password
- Secret gesture (10 clicks in corner) to access unlock
- All unlock attempts are logged

### 4. Local Storage Persistence
- Branch ID stored in both localStorage and sessionStorage
- Configuration survives app refreshes and browser restarts
- Branch lock prevents accidental changes

## Monitoring & Management

### 1. Device Status Dashboard
Create an admin dashboard to monitor:
- Active tablets per branch
- Last seen timestamps
- Device information
- Order counts per tablet

### 2. Remote Reconfiguration
To move a tablet to a different branch:
1. Send new URL with updated branch parameter
2. Tablet will automatically reconfigure
3. Previous registration is updated

### 3. Troubleshooting

#### Tablet Won't Configure
- Check network connection
- Verify branch ID exists in database
- Check browser console for errors

#### Branch Validation Fails
- Ensure backend endpoints are accessible
- Check if branch is marked as active
- Verify API URL configuration

#### Emergency Reset
1. Use admin unlock (10 clicks + password)
2. Or clear browser data and restart
3. Reconfigure with correct branch URL

## Environment Variables

Add these to your environment:

```env
# Admin unlock password
ADMIN_UNLOCK_PASSWORD=your_secure_password_here

# API base URL for tablets
NEXT_PUBLIC_API_URL=https://api.pulsecoffee.com/api
```

## Testing

Test the system with these scenarios:

1. **Fresh tablet setup** - Configure new tablet with branch URL
2. **Existing tablet** - Verify locked tablet maintains branch assignment
3. **Invalid branch** - Test with non-existent branch ID
4. **Network failure** - Test behavior when backend is unreachable
5. **Admin unlock** - Test emergency unlock procedure
6. **Branch switching** - Test reconfiguration with new branch URL

## Production Deployment

1. Deploy backend changes with new endpoints
2. Run database migrations for new tables
3. Seed branches data
4. Configure environment variables
5. Deploy frontend with branch management system
6. Set up tablets with branch-specific URLs
7. Test order flow on each tablet
8. Enable monitoring and logging
