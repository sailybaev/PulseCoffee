# PulseCoffee Web Test Interface

This document describes how to use the comprehensive web interface to test all PulseCoffee backend functionality.

## Getting Started

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run start:dev
   ```

2. **Access the Test Interface:**
   Open your browser and go to: `http://localhost:3000/public/test-app.html`

## Features Tested

### 🔐 Authentication & Authorization
- **User Registration:** Create new user accounts with phone number and password
- **User Login:** Authenticate with existing credentials
- **Role-based Access:** Different features available based on user role (CLIENT, BARISTA, ADMIN)
- **JWT Token Management:** Automatic token refresh and session management
- **Logout:** Secure session termination

### 🛍️ Product Management
- **Create Products:** Add new coffee, tea, dessert, and snack items (Admin only)
- **View Products:** Browse all available products with details
- **Product Categories:** Filter products by category
- **Price Management:** Set base prices for products

### 🏪 Branch Management
- **Create Branches:** Add new coffee shop locations (Admin only)
- **View Branches:** List all available branches
- **Branch Selection:** Choose branches for order placement

### 📦 Order Management
- **Create Orders:** Place orders with multiple items (Client/Admin)
- **View Orders:** See all orders with details (Admin/Barista)
- **Automatic Calculations:** Total price calculated from product prices
- **Order Status:** Track order progress

### 👥 User Management
- **Create Users:** Add new users with specific roles (Admin only)
- **Role Assignment:** Set user roles (CLIENT, BARISTA, ADMIN)
- **User Information:** Display current user details

### 🔌 WebSocket Integration
- **Real-time Connection:** Live WebSocket connection status indicator
- **Barista Rooms:** Join/leave branch-specific rooms for order notifications
- **Live Events:** Real-time display of WebSocket events
- **Order Notifications:** Instant notifications for new orders and status updates

### 📁 File Upload
- **File Upload:** Test file upload functionality
- **URL Generation:** Get accessible URLs for uploaded files

## User Roles & Permissions

### CLIENT
- Register and login
- View products and branches
- Create orders
- View own orders
- Receive WebSocket notifications

### BARISTA
- All CLIENT permissions
- View all orders
- Join barista rooms for real-time order notifications
- Update order status

### ADMIN
- All BARISTA permissions
- Create products, branches, and users
- Manage all system entities
- Full access to all features

## Testing Workflow

### 1. Initial Setup
1. Register a new user or login with existing credentials
2. Check the WebSocket connection (green indicator)
3. Verify user information is displayed correctly

### 2. Product Testing
1. Navigate to Products tab
2. Create a new product (requires ADMIN role)
3. Refresh and verify the product appears
4. Test different categories and prices

### 3. Branch Testing
1. Navigate to Branches tab
2. Create a new branch (requires ADMIN role)
3. Refresh and verify the branch appears
4. Note the branch ID for WebSocket testing

### 4. Order Testing
1. Navigate to Orders tab
2. Add order items using the "Add Item" button
3. Select products and quantities
4. Place the order
5. Verify the order appears in the orders list
6. Check WebSocket events for order notifications

### 5. WebSocket Testing
1. Navigate to WebSocket tab
2. Enter a branch ID and join the barista room
3. Create an order for that branch
4. Verify real-time notifications appear
5. Test leaving the room

### 6. User Management Testing (Admin Only)
1. Navigate to Users tab
2. Create users with different roles
3. Test login with new users
4. Verify role-based access restrictions

### 7. File Upload Testing
1. Navigate to Files tab
2. Select and upload a file
3. Verify the upload succeeds and URL is provided
4. Test accessing the uploaded file

## WebSocket Events

The interface displays real-time WebSocket events including:
- Connection/disconnection status
- Joining/leaving barista rooms
- New order notifications
- Order status updates
- Custom test events

## API Endpoints Tested

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `POST /auth/users` - Create user (Admin)
- `GET /products` - List products
- `POST /products` - Create product (Admin)
- `GET /branches` - List branches
- `POST /branches` - Create branch (Admin)
- `GET /orders` - List orders
- `POST /orders` - Create order
- `POST /upload` - File upload

## Troubleshooting

### Common Issues

1. **WebSocket Not Connecting:**
   - Ensure you're logged in
   - Check browser console for errors
   - Verify the server is running

2. **Permission Denied:**
   - Check your user role
   - Some features require ADMIN or BARISTA roles
   - Try logging in with a different user

3. **Orders Not Creating:**
   - Ensure you've added at least one item
   - Verify branch is selected
   - Check that products exist

4. **File Upload Fails:**
   - Check file size limits
   - Verify proper authentication
   - Ensure upload directory exists

### Browser Console

Check the browser console for detailed error messages and debugging information. The interface logs important events and API responses.

## Security Features Tested

- JWT token-based authentication
- Automatic token refresh
- Role-based authorization
- Secure WebSocket connections
- Input validation
- CORS configuration

This comprehensive test interface validates all major functionality of the PulseCoffee backend system, including REST APIs, WebSocket communication, file uploads, and role-based security.
