# Currency Handling in PulseCoffee

## Overview
All prices in the PulseCoffee application are handled in **KZT (Kazakhstani Tenge)**.

## Currency Configuration
- **Currency Code**: KZT
- **Currency Symbol**: ₸
- **Decimal Places**: 2

## Price Fields
All monetary amounts throughout the application are in KZT:

### Products
- `Product.basePrice` - Base price in KZT
- `ProductInBranch.price` - Branch-specific price in KZT
- `ProductCustomization.price` - Additional customization price in KZT

### Orders
- `Order.total` - Total order amount in KZT
- `OrderItem.price` - Price per item in KZT

## Implementation Details

### Constants
The currency configuration is defined in `src/constants/currency.constants.ts`:
- Currency metadata (code, symbol, name, decimal places)
- Price formatting function
- Price validation function

### Validation
All price inputs are validated to ensure they are:
- Non-negative numbers
- Finite values
- Properly formatted for KZT currency

### API Documentation
All DTOs include JSDoc comments specifying that prices are in KZT:
- `CreateOrderDto.total` - Total order amount in KZT
- `OrderItemDto.price` - Price per item in KZT
- `CreateProductDto.basePrice` - Base price in KZT
- `AddProductToBranchDto.price` - Branch-specific price in KZT
- `CreateCustomizationDto.price` - Additional customization price in KZT

## Usage Examples

### Creating a Product with KZT Price
```typescript
const product = {
  name: "Espresso",
  basePrice: 500, // 500 KZT
  category: "COFFEE"
};
```

### Creating an Order with KZT Prices
```typescript
const order = {
  items: [
    {
      productId: "product-id",
      quantity: 2,
      price: 500 // 500 KZT per item
    }
  ],
  total: 1000 // 1000 KZT total
};
```

### Formatting Prices for Display
```typescript
import { formatPrice } from './constants/currency.constants';

const formattedPrice = formatPrice(500); // "500.00 ₸"
```

## Database Schema
The Prisma schema includes comments on all price fields indicating they are in KZT:
- All `Float` fields representing prices have comments specifying KZT currency
- This ensures database documentation is clear about the currency used

## Frontend Integration
When displaying prices in the frontend, ensure:
1. Prices are formatted with the KZT symbol (₸)
2. Decimal places are displayed consistently (2 decimal places)
3. Large amounts are formatted appropriately for the Kazakhstani market

## Migration Considerations
If currency conversion is needed in the future:
1. All existing prices are in KZT
2. Use the currency constants for consistent conversion rates
3. Update API documentation to specify multi-currency support if implemented
