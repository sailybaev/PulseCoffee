# Barista App Deployment Guide

## Overview

The PulseCoffee Barista App is a Next.js application that provides real-time order management for baristas. It features URL-based branch configuration, WebSocket connectivity for live updates, and audio notifications.

## Quick Deployment

### Development
```bash
cd frontend/barista-app
npm install
npm run dev
```
Access at: http://localhost:3002

### Production
```bash
cd frontend/barista-app
npm install
npm run build
npm start
```

## Branch-Specific Setup

### URL Configuration
Access the app with a branch parameter to automatically configure for a specific location:
```
http://localhost:3002?branch=downtown-cafe
http://localhost:3002?branch=airport-terminal
```

### Device Registration
Each device is automatically registered with:
- Unique device ID (format: `barista_[timestamp]_[random]`)
- Branch association
- Device information (screen, browser)
- Registration timestamp

### Admin Override
Use admin password to unlock and reconfigure devices:
1. Click "Admin Override" on setup screen
2. Enter admin password
3. Device will be unlocked for reconfiguration

## WebSocket Connection

The app connects to the backend WebSocket server for real-time updates:
- **New orders** - Instant notification with sound
- **Status updates** - Real-time order state changes
- **Connection status** - Visual indicator in header

### Connection Events
- `newOrder` - New order received
- `orderStatusUpdate` - Order status changed
- `joinBaristaRoom` - Subscribe to branch updates
- `leaveBaristaRoom` - Unsubscribe from updates

## Audio Notifications

### Sound Types
- **New Order** - Pleasant C major chord sequence
- **Status Update** - Confirmation beep
- **Completion** - Success melody
- **Error** - Alert tone

### Audio Setup
1. Audio requires user interaction to enable
2. Click notification bell (🔔) in header
3. Grant browser audio permissions if prompted

## Order Management

### Order Statuses
1. **PENDING** → **CONFIRMED** - Acknowledge order
2. **CONFIRMED** → **PREPARING** - Start preparation
3. **PREPARING** → **READY** - Mark ready for pickup
4. **READY** → **COMPLETED** - Customer collected

### Status Actions
- **Advance Status** - Move to next status in workflow
- **Cancel Order** - Available for PENDING/CONFIRMED/PREPARING orders
- **View Details** - See items, customizations, customer info

## Environment Configuration

### Required Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Production Environment
```env
NEXT_PUBLIC_API_URL=https://api.pulsecoffee.com/api
```

## Browser Requirements

### Supported Features
- WebSocket support (all modern browsers)
- Web Audio API (Chrome 34+, Firefox 25+, Safari 6+)
- Local Storage (all modern browsers)
- Session Storage (all modern browsers)

### Responsive Design
- Minimum width: 768px (tablet)
- Optimized for tablets and desktop
- Touch-friendly interface for tablet use

## Security Features

### Branch Validation
- Branch must exist and be active
- Device registration required
- Token-based authentication

### Access Control
- Only BARISTA and ADMIN roles allowed
- JWT token validation
- Automatic token refresh

### Device Tracking
- Each device gets unique identifier
- Track active devices per branch
- Admin can view device history

## Monitoring & Debugging

### Connection Status
Visual indicator in header shows:
- **Green dot** - Connected to server
- **Red dot** - Disconnected from server

### Browser Console
Check console for:
- WebSocket connection logs
- Order update events
- Audio initialization status
- API request/response logs

### Network Tab
Monitor:
- WebSocket connection (`/socket.io/`)
- API requests (`/api/orders`, `/api/auth`)
- Static assets loading

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check backend server is running
- Verify CORS settings allow WebSocket
- Check firewall/proxy settings

**Audio Not Playing**
- Click notification bell to enable
- Check browser audio settings
- Ensure device volume is up
- Try refreshing page

**Orders Not Loading**
- Check authentication token
- Verify user has BARISTA role
- Check branch ID configuration
- Review backend logs

**Branch Setup Fails**
- Ensure branch exists and is active
- Check network connectivity
- Try admin override if configured
- Verify backend branch validation

### Reset Device
To completely reset device configuration:
1. Use admin override with password
2. Or clear browser local storage:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. Refresh page to start setup flow

## Integration Testing

### Test Scenarios

1. **Branch Setup Flow**
   - Access with `?branch=test-branch`
   - Verify device registration
   - Check branch validation

2. **Authentication**
   - Login with barista credentials
   - Verify role-based access
   - Test token refresh

3. **Real-time Updates**
   - Create order via customer app
   - Verify new order notification
   - Test status update propagation

4. **Audio Notifications**
   - Enable audio permissions
   - Test all notification sounds
   - Verify different order events

5. **Order Management**
   - Test status progression
   - Verify cancel functionality
   - Check order filtering

## Production Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] All tests passing
- [ ] WebSocket endpoint accessible
- [ ] Audio permissions handled

### Post-deployment
- [ ] Branch setup working
- [ ] Authentication functional
- [ ] Real-time updates active
- [ ] Audio notifications playing
- [ ] Order management working
- [ ] Admin override accessible

### Performance
- [ ] Page load time < 3 seconds
- [ ] WebSocket connection < 1 second
- [ ] Order updates < 500ms latency
- [ ] Audio latency < 100ms
- [ ] Responsive on target devices
