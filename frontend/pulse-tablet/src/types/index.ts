export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'COFFEE' | 'TEA' | 'PASTRY' | 'SNACK' | 'COLD_DRINKS' | 'FRESH_JUICE' | 'HOT_BEVERAGES' | 'LEMONADES' | 'OTHER';
  imageUrl?: string;
  customizations: Customization[];
}

export interface Customization {
  id: string;
  type: 'CUP_SIZE' | 'MILK_TYPE' | 'SYRUP' | 'EXTRA_SHOT' | 'TEMPERATURE';
  name: string;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  additionalPrice: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  customizations: SelectedCustomization[];
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  name: string;
  additionalPrice: number;
  type: string;
}

export interface Order {
  items: CartItem[];
  customerName: string;
  total: number;
  paymentMethod: 'QR' | 'CARD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  branchId: string;
}

export type OrderStep = 'welcome' | 'menu' | 'customize' | 'cart' | 'payment' | 'thankyou';
