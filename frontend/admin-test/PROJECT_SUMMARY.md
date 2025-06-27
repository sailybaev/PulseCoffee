# Pulse Coffee Frontend - Next.js Admin Test

## 🎯 Project Overview

This Next.js application provides a comprehensive admin test interface for the PulseCoffee management system. It's been created as a separate frontend application to replace the HTML test interface with a modern, type-safe React application.

## 📁 Project Structure

```
/Users/sailybaev/Documents/projects/PulseCoffee/frontend/admin-test/
├── README.md                           # Comprehensive documentation
├── package.json                        # Dependencies and scripts
├── next.config.js                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── start-dev.sh                        # Development startup script
├── INSTALL.sh                          # Installation guide script
├── next-env.d.ts                       # Next.js TypeScript declarations
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout component
│   │   ├── page.tsx                    # Home page (entry point)
│   │   └── globals.css                 # Global styles with Tailwind
│   ├── components/
│   │   ├── PulseCoffeeAdminTest.tsx    # Main application component
│   │   └── Notification.tsx            # Notification system
│   ├── hooks/
│   │   └── useWebSocket.ts             # WebSocket management hook
│   ├── lib/
│   │   └── api.ts                      # Axios configuration & interceptors
│   └── types/
│       └── index.ts                    # TypeScript type definitions
└── __tests__/
    └── page.test.tsx                   # Basic test setup
```

## 🚀 Getting Started

### Quick Start

1. **Navigate to the project:**
   ```bash
   cd /Users/sailybaev/Documents/projects/PulseCoffee/frontend/admin-test
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development:**
   ```bash
   # Option 1: Use the startup script
   ./start-dev.sh
   
   # Option 2: Direct command
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000 (must be running)

### Using Installation Scripts

```bash
# Show installation guide
./INSTALL.sh

# Start development server with checks
./start-dev.sh
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and customize:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Port Configuration

The app runs on port **3001** to avoid conflicts with the backend (port 3000).

## 🌟 Features

### ✅ Implemented
- 📦 **Project Structure**: Complete Next.js 14 setup with TypeScript
- 🎨 **Styling**: Tailwind CSS with custom Pulse Coffee theme
- 🔌 **API Integration**: Axios with auto-retry and token refresh
- 🔄 **WebSocket**: Socket.IO client integration for real-time updates
- 📱 **Responsive**: Mobile-friendly design
- 🛡️ **Type Safety**: Full TypeScript coverage
- 📋 **Component Architecture**: Modular, reusable components

### 🚧 To Be Implemented
The main `PulseCoffeeAdminTest.tsx` component provides the foundation for:

1. **Authentication System**
   - Login/Register forms
   - Admin authentication
   - JWT token management
   - Auto-refresh capabilities

2. **Product Management**
   - CRUD operations
   - Image upload
   - Category management
   - Product editing modal

3. **Branch Management**
   - Location management
   - Branch assignments

4. **Order System**
   - Order creation/tracking
   - Status updates
   - Real-time notifications

5. **WebSocket Integration**
   - Live order updates
   - Barista room management
   - Event logging

6. **File Management**
   - Image uploads
   - File gallery
   - Image modal viewer

## 🔗 Integration with Backend

The frontend is designed to work seamlessly with the existing PulseCoffee backend:

- **API Endpoints**: All backend routes are supported
- **Authentication**: JWT token-based auth with refresh
- **File Uploads**: Multipart form data for images
- **WebSocket**: Real-time order and status updates
- **Error Handling**: Comprehensive error management

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start development server (port 3001)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Development Flow

1. **Backend First**: Ensure the PulseCoffee backend is running
2. **Frontend**: Start this Next.js application
3. **Testing**: Use the admin interface to test all backend features
4. **Real-time**: WebSocket features work automatically when both servers are running

### Key Files to Complete

The foundation is in place. The main areas to expand:

1. **`PulseCoffeeAdminTest.tsx`**: Complete the dashboard sections
2. **Component Splitting**: Break into smaller, focused components
3. **API Hooks**: Create custom hooks for each API endpoint
4. **Form Components**: Build reusable form components
5. **Error Boundaries**: Add React error boundaries

## 📚 Usage Examples

### Default Admin Login
```
Phone: +77777777777
Password: admin123
```

### API Integration
```typescript
import api from '@/lib/api'

// The API client handles tokens automatically
const products = await api.get('/products')
const newProduct = await api.post('/products', data)
```

### WebSocket Usage
```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

const { isConnected, events, joinBaristaRoom } = useWebSocket({
  accessToken,
  user: currentUser
})
```

## 🔄 Migration from HTML

This Next.js app replaces the original HTML test interface (`backend/public/test-app.html`) with:

- ✅ Better code organization
- ✅ Type safety with TypeScript
- ✅ Component reusability
- ✅ Modern React patterns
- ✅ Improved developer experience
- ✅ Better error handling
- ✅ Modular architecture

## 🎯 Next Steps

1. **Install Dependencies**: Run `npm install`
2. **Start Development**: Use `./start-dev.sh` or `npm run dev`
3. **Complete Implementation**: Expand the component functionality
4. **Add Tests**: Implement comprehensive testing
5. **Deploy**: Build and deploy for production use

## 📞 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review the component structure
3. Ensure backend compatibility
4. Verify WebSocket connections

---

**Ready to start developing!** 🚀

The foundation is solid - now it's time to complete the implementation and enjoy the modern development experience.
