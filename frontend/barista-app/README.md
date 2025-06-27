# PulseCoffee Barista App

A real-time order management web application for baristas, built with Next.js and TypeScript.

## Features

- **URL-based branch initialization** - Easy deployment with branch-specific URLs
- **Real-time order updates** - WebSocket connection for instant notifications
- **Sound notifications** - Audio alerts for new orders and status changes
- **Order status management** - Update orders through their lifecycle
- **Device registration** - Track and manage barista devices
- **Admin override** - Password-protected maintenance access
- **Responsive design** - Works on tablets, laptops, and desktop computers

## Quick Start

### Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:3002

### Branch Setup

Access the barista app with a branch parameter to set up a specific location:
```
http://localhost:3002?branch=BRANCH_ID
```

Example:
```
http://localhost:3002?branch=downtown-cafe
```

### Authentication

Baristas must log in with their phone number and password. Only users with `BARISTA` or `ADMIN` roles can access the application.

## Order Statuses

The app manages orders through the following states:

- **Pending** - New order received
- **Confirmed** - Order acknowledged by barista
- **Preparing** - Order is being made
- **Ready** - Order ready for pickup
- **Completed** - Order fulfilled
- **Cancelled** - Order cancelled

## Audio Notifications

The app provides different sound cues for:
- New order received (pleasant chord)
- Status update (confirmation beep)
- Order completion (success melody)
- Errors (alert tone)

Audio requires user interaction to enable. Click the notification bell icon in the header.

## Device Management

Each barista device is automatically registered with:
- Unique device ID
- Branch association
- Registration timestamp
- Device information (screen resolution, user agent)

## Admin Features

- **Admin override**: Use the admin password to unlock and reconfigure devices
- **Branch validation**: Ensure devices are assigned to valid, active branches
- **Device tracking**: Monitor which devices are active in each branch

## API Integration

The app connects to the PulseCoffee backend API for:
- Authentication
- Order management
- Branch validation
- Device registration
- Real-time WebSocket updates

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Branch-specific Deployment

You can deploy branch-specific versions by setting the branch ID in the URL:

```
https://barista.pulsecoffee.com?branch=downtown-cafe
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For production, update the API URL to your deployed backend.

## Browser Support

- Modern browsers with WebSocket support
- Audio Web API support required for notifications
- Responsive design for tablets (768px+) and desktop

## Troubleshooting

### Connection Issues
- Check if the backend API is running
- Verify WebSocket connection in browser dev tools
- Ensure network allows WebSocket connections

### Audio Not Working
- Click the notification bell to enable audio
- Check browser audio permissions
- Ensure device volume is turned up

### Branch Setup Problems
- Verify the branch ID exists in the system
- Check if the branch is marked as active
- Try the admin override with correct password

### Authentication Errors
- Ensure user has BARISTA or ADMIN role
- Check if credentials are correct
- Verify backend authentication service is running

## Development Notes

### Project Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── context/            # React context providers
└── services/           # API and utility services
```

### Key Components
- `Dashboard` - Main order management interface
- `OrderCard` - Individual order display and controls
- `BranchSetup` - Branch configuration flow
- `LoginForm` - Authentication interface

### Services
- `orderService` - Order management and API calls
- `authService` - Authentication and user management
- `webSocketService` - Real-time communication
- `audioService` - Sound notification system
- `branchService` - Branch validation and device registration

## Support

For issues or questions, please check the main project documentation or contact the development team.
