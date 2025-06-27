import { Product, Customization } from '../types';

// Mock customizations for Pulse Coffee
const cupSizeCustomization: Customization = {
  id: 'cup-size',
  type: 'CUP_SIZE',
  name: 'Размер',
  options: [
    { id: 'small', name: '250мл', additionalPrice: 0 },
    { id: 'medium', name: '350мл', additionalPrice: 100 },
    { id: 'large', name: '450мл', additionalPrice: 200 },
  ]
};

const milkTypeCustomization: Customization = {
  id: 'milk-type',
  type: 'MILK_TYPE',
  name: 'Тип молока',
  options: [
    { id: 'whole', name: 'Обычное молоко', additionalPrice: 0 },
    { id: 'oat', name: 'Овсяное молоко', additionalPrice: 490 },
    { id: 'almond', name: 'Миндальное молоко', additionalPrice: 490 },
    { id: 'soy', name: 'Соевое молоко', additionalPrice: 490 },
  ]
};

const syrupCustomization: Customization = {
  id: 'syrup',
  type: 'SYRUP',
  name: 'Сироп',
  options: [
    { id: 'none', name: 'Без сиропа', additionalPrice: 0 },
    { id: 'vanilla', name: 'Ванильный сироп', additionalPrice: 100 },
    { id: 'caramel', name: 'Карамельный сироп', additionalPrice: 100 },
    { id: 'peach', name: 'Персиковый сироп', additionalPrice: 100 },
  ]
};

const extraShotCustomization: Customization = {
  id: 'extra-shot',
  type: 'EXTRA_SHOT',
  name: 'Дополнительные опции',
  options: [
    { id: 'none', name: 'Обычный', additionalPrice: 0 },
    { id: 'extra-shot', name: 'Дополнительный шот', additionalPrice: 150 },
    { id: 'decaf', name: 'Декаф', additionalPrice: 0 },
  ]
};

const temperatureCustomization: Customization = {
  id: 'temperature',
  type: 'TEMPERATURE',
  name: 'Temperature',
  options: [
    { id: 'hot', name: 'Hot', additionalPrice: 0 },
    { id: 'iced', name: 'Iced', additionalPrice: 0 },
  ]
};

// Mock products matching the Pulse Coffee database
export const mockProducts: Product[] = [
  // COFFEE
  {
    id: 'americano',
    name: 'Американо',
    description: 'Классический американо',
    price: 690, // Base price for 250ml
    category: 'COFFEE',
    customizations: [cupSizeCustomization, extraShotCustomization, temperatureCustomization]
  },
  {
    id: 'cappuccino',
    name: 'Капучино',
    description: 'Эспрессо с взбитым молоком',
    price: 890, // Base price for 250ml
    category: 'COFFEE',
    customizations: [cupSizeCustomization, milkTypeCustomization, syrupCustomization, extraShotCustomization, temperatureCustomization]
  },
  {
    id: 'latte',
    name: 'Латте',
    description: 'Эспрессо с молоком',
    price: 990, // Base price for 350ml (smallest available)
    category: 'COFFEE',
    customizations: [cupSizeCustomization, milkTypeCustomization, syrupCustomization, extraShotCustomization, temperatureCustomization]
  },
  {
    id: 'flat-white',
    name: 'Флэт Уайт',
    description: 'Крепкий кофе с молоком',
    price: 890,
    category: 'COFFEE',
    customizations: [cupSizeCustomization, milkTypeCustomization, syrupCustomization, extraShotCustomization, temperatureCustomization]
  },
  {
    id: 'mokko',
    name: 'Мокко',
    description: 'Кофе с шоколадом',
    price: 1190,
    category: 'COFFEE',
    customizations: [cupSizeCustomization, milkTypeCustomization, extraShotCustomization, temperatureCustomization]
  },
  
  // RAF COFFEE
  {
    id: 'raf-peach',
    name: 'Раф Персиковый',
    description: 'Раф с персиковым сиропом',
    price: 1390,
    category: 'COFFEE',
    customizations: [cupSizeCustomization, milkTypeCustomization, extraShotCustomization]
  },
  
  // HOT BEVERAGES
  {
    id: 'cocoa',
    name: 'Какао',
    description: 'Горячее какао',
    price: 990,
    category: 'HOT_BEVERAGES',
    customizations: []
  },
  {
    id: 'matcha',
    name: 'Матча',
    description: 'Матча латте',
    price: 990,
    category: 'HOT_BEVERAGES',
    customizations: [milkTypeCustomization]
  },
  
  // TEA
  {
    id: 'cranberry-tea',
    name: 'Клюквенный Чай',
    description: 'Согревающий клюквенный чай',
    price: 990,
    category: 'TEA',
    customizations: []
  },
  
  // COLD DRINKS
  {
    id: 'iced-latte',
    name: 'Айс Латте',
    description: 'Холодный латте',
    price: 1390,
    category: 'COLD_DRINKS',
    customizations: [milkTypeCustomization, syrupCustomization]
  },
  
  // LEMONADES
  {
    id: 'mango-passion-lemonade',
    name: 'Манго-Маракуйя',
    description: 'Лимонад манго-маракуйя',
    price: 990,
    category: 'LEMONADES',
    customizations: []
  },
  
  // FRESH JUICE
  {
    id: 'orange-fresh',
    name: 'Апельсиновый Фреш',
    description: 'Свежевыжатый апельсиновый сок',
    price: 2090,
    category: 'FRESH_JUICE',
    customizations: []
  }
];

export const getProductsByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category);
};

export const getProductById = (id: string) => {
  return mockProducts.find(product => product.id === id);
};
