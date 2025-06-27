# Pulse Coffee Admin Test - Next.js Frontend

This is a Next.js frontend application for testing the PulseCoffee admin interface. It provides a comprehensive interface for managing products, branches, orders, and other administrative functions.

## Features

- 🔐 Authentication (Login/Register/Admin Login)
- 📦 Product Management (CRUD operations with image upload)
- 🏢 Branch Management
- 📋 Order Management with real-time updates
- 🔗 Product-Branch Assignments
- 📸 Image Upload and Management
- 🔌 WebSocket Integration for real-time notifications
- 📱 Responsive design with Tailwind CSS
- 🎯 TypeScript for type safety

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Running PulseCoffee backend server (typically on port 3000)

## Installation

1. Navigate to the project directory:
```bash
cd /Users/sailybaev/Documents/projects/PulseCoffee/frontend/admin-test
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env.local
```

Edit `.env.local` if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3001](http://localhost:3001) in your browser

The app will run on port 3001 to avoid conflicts with the backend API server running on port 3000.

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PulseCoffeeAdminTest.tsx  # Main app component
│   └── Notification.tsx   # Notification component
├── hooks/                 # Custom React hooks
│   └── useWebSocket.ts    # WebSocket hook
├── lib/                   # Utility libraries
│   └── api.ts            # Axios configuration
└── types/                # TypeScript type definitions
    └── index.ts          # Main type definitions
```

## Usage

### Authentication

1. **Login**: Use existing credentials
2. **Register**: Create a new user account
3. **Admin Login**: Use admin credentials for full access
   - Default admin: `+77777777777` / `admin123`

### Features

- **Products**: Create, read, update, delete products with image uploads
- **Branches**: Manage coffee shop locations
- **Orders**: Create and track orders with real-time status updates
- **Product-Branches**: Assign products to specific branches with inventory
- **WebSocket**: Real-time notifications for new orders and status updates
- **Images**: Upload and manage product images

### WebSocket Integration

The app automatically connects to the backend WebSocket server when authenticated. Features include:

- Real-time order notifications
- Order status updates
- Barista room management for branch-specific notifications

## API Integration

The frontend communicates with the PulseCoffee backend API:

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT tokens with automatic refresh
- **File Uploads**: Multipart form data for images
- **Real-time**: Socket.IO for live updates

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

## Development Notes

- The app uses TypeScript for type safety
- Tailwind CSS provides utility-first styling
- Custom hooks manage WebSocket connections and API calls
- Components are designed to be modular and reusable
- Error handling includes user-friendly notifications

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the backend server is running on port 3000
2. **WebSocket Errors**: Check if the backend WebSocket server is properly configured
3. **Image Upload Issues**: Verify the backend upload endpoint is accessible
4. **Authentication Errors**: Clear localStorage and try logging in again

### Error Messages

- `Cannot connect to API`: Backend server is not running
- `WebSocket disconnected`: Real-time features may not work
- `Unauthorized`: Token has expired, try logging in again

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Include loading states for async operations
5. Test WebSocket functionality thoroughly

## License

This project is part of the PulseCoffee system and follows the same licensing terms.
