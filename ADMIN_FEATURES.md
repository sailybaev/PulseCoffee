# Admin & Barista Order Management Features

This document describes the enhanced order management functionality for admins and baristas, improved image uploading, and product creation with photo assignment.

## 🔧 New Features

### 1. Enhanced Order Editing for Admins & Baristas

#### Available Endpoints:

**PATCH `/orders/:id`** - Partial order update
- **Roles**: ADMIN, BARISTA
- **Body Options**:
  ```json
  {
    "status": "PREPARING", // Optional: Update order status
    "items": [             // Optional: Update order items
      {
        "productId": "uuid",
        "quantity": 2,
        "price": 4.50
      }
    ],
    "total": 15.50         // Optional: Update total (auto-calculated if items provided)
  }
  ```

**PUT `/orders/:id`** - Full order update
- **Roles**: ADMIN, BARISTA
- Same body structure as PATCH, but intended for complete updates

**DELETE `/orders/:id`** - Delete order
- **Roles**: ADMIN only
- Permanently removes the order

#### Features:
- ✅ Update order status (PENDING → CONFIRMED → PREPARING → READY → COMPLETED)
- ✅ Modify order items (add, remove, change quantities)
- ✅ Automatic total recalculation when items are updated
- ✅ Real-time WebSocket notifications for status changes
- ✅ Complete order deletion (admin only)

### 2. Fixed & Enhanced Image Uploading

#### Available Endpoints:

**POST `/upload/image`** - Upload image file
- **Role**: ADMIN
- **Content-Type**: multipart/form-data
- **Field**: `file` (image file)
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- **Response**:
  ```json
  {
    "filename": "1234567890-image.jpg",
    "url": "http://localhost:3000/uploads/1234567890-image.jpg",
    "originalName": "my-image.jpg",
    "size": 245760,
    "mimetype": "image/jpeg"
  }
  ```

#### Improvements Made:
- ✅ Better error handling and validation
- ✅ Automatic directory creation for uploads
- ✅ Enhanced file naming with timestamp + clean original name
- ✅ File size and type validation
- ✅ Support for WebP format
- ✅ Detailed response with file metadata

### 3. Product Creation with Photo Assignment

#### Available Endpoints:

**POST `/products`** - Create product (existing endpoint)
- **Role**: ADMIN
- **Body**:
  ```json
  {
    "name": "Cappuccino",
    "description": "Rich espresso with steamed milk",
    "basePrice": 4.50,
    "category": "COFFEE",
    "imageUrl": "http://localhost:3000/uploads/image.jpg" // Optional
  }
  ```

**POST `/products/with-image`** - Create product with image upload (NEW)
- **Role**: ADMIN
- **Content-Type**: multipart/form-data
- **Fields**:
  - `name`: Product name
  - `description`: Product description
  - `basePrice`: Base price (number)
  - `category`: Product category
  - `image`: Image file (optional)

**PATCH `/products/:id/image`** - Update product image (NEW)
- **Role**: ADMIN
- **Content-Type**: multipart/form-data
- **Field**: `image` (image file)

#### Workflow Options:

1. **Create product with existing image URL**:
   ```javascript
   POST /products
   {
     "name": "Latte",
     "basePrice": 5.00,
     "imageUrl": "http://localhost:3000/uploads/existing-image.jpg"
   }
   ```

2. **Upload image first, then create product**:
   ```javascript
   // Step 1: Upload image
   POST /upload/image (with image file)
   // Response: { "url": "http://localhost:3000/uploads/image.jpg" }
   
   // Step 2: Create product with image URL
   POST /products
   {
     "name": "Mocha",
     "basePrice": 5.50,
     "imageUrl": "http://localhost:3000/uploads/image.jpg"
   }
   ```

3. **Create product with image in single request**:
   ```javascript
   POST /products/with-image (multipart form data)
   // Form fields: name, description, basePrice, category, image
   ```

## 🧪 Testing

### Test Interface
A comprehensive admin test interface is available at:
```
http://localhost:3000/admin-test.html
```

#### Features of Test Interface:
- 🔐 Admin authentication
- 📦 Product creation (with and without image upload)
- 📋 Order management (view, update status, delete)
- 🖼️ Image upload testing
- 📱 Responsive design
- ✅ Real-time feedback and error handling

### Manual Testing Examples:

1. **Test Order Editing**:
   ```bash
   # Update order status
   curl -X PATCH http://localhost:3000/orders/{order-id} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"status": "PREPARING"}'
   
   # Update order items
   curl -X PATCH http://localhost:3000/orders/{order-id} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {"productId": "product-uuid", "quantity": 2, "price": 4.50}
       ]
     }'
   ```

2. **Test Image Upload**:
   ```bash
   curl -X POST http://localhost:3000/upload/image \
     -H "Authorization: Bearer {token}" \
     -F "file=@/path/to/image.jpg"
   ```

3. **Test Product Creation with Image**:
   ```bash
   curl -X POST http://localhost:3000/products/with-image \
     -H "Authorization: Bearer {token}" \
     -F "name=Americano" \
     -F "description=Black coffee" \
     -F "basePrice=3.50" \
     -F "category=COFFEE" \
     -F "image=@/path/to/coffee.jpg"
   ```

## 🔒 Security & Permissions

### Role-Based Access:
- **ADMIN**: Full access to all order operations, product management, and image uploads
- **BARISTA**: Can view and update order status, cannot delete orders or manage products
- **CLIENT**: Can only view their own orders

### File Upload Security:
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Secure filename generation
- ✅ Admin-only access
- ✅ Directory traversal protection

## 📝 Database Changes

No database migrations required. All features work with the existing Prisma schema:

- `Order.status` - for status updates
- `OrderItem` - for item modifications  
- `Product.imageUrl` - for image assignment
- File uploads stored in `/uploads` directory

## 🚀 Deployment Notes

1. Ensure the `uploads` directory has proper write permissions
2. Configure `BASE_URL` environment variable for correct image URLs
3. Set up proper file serving for the `/uploads` route
4. Consider using cloud storage (AWS S3, etc.) for production image hosting

## 🐛 Error Handling

The enhanced features include comprehensive error handling:

- Invalid file types/sizes
- Missing authentication
- Insufficient permissions  
- Non-existent orders/products
- Database constraint violations
- Network/upload failures

All errors return appropriate HTTP status codes and descriptive messages.
