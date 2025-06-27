-- Clean up the current product structure and create proper single products with size customizations

-- 1. Remove all size-specific product variants
DELETE FROM "ProductInBranch" WHERE "productId" IN (
  'americano-250', 'americano-350', 'americano-450',
  'cappuccino-250', 'cappuccino-350', 'cappuccino-450',
  'latte-350', 'latte-450',
  'cocoa-350', 'matcha-350', 'coffee-with-milk-350',
  'raf-peach', 'raf-pineapple-caramel', 'raf-citrus-cookie',
  'mango-passion-lemonade', 'kiwi-lime-lemonade', 'citrus-lemonade', 'mojito-lemonade', 'mango-passion-lemonade-kz',
  'iced-latte', 'bumble-coffee', 'iced-latte-kz', 'bumble-coffee-kz',
  'orange-fresh', 'cranberry-tea', 'sea-buckthorn-tea', 'raspberry-tea', 'tashkent-tea', 'glintwein', 'cranberry-tea-kz'
);

DELETE FROM "ProductCustomization" WHERE "productId" IN (
  'americano-250', 'americano-350', 'americano-450',
  'cappuccino-250', 'cappuccino-350', 'cappuccino-450',
  'latte-350', 'latte-450',
  'cocoa-350', 'matcha-350', 'coffee-with-milk-350',
  'raf-peach', 'raf-pineapple-caramel', 'raf-citrus-cookie',
  'mango-passion-lemonade', 'kiwi-lime-lemonade', 'citrus-lemonade', 'mojito-lemonade', 'mango-passion-lemonade-kz',
  'iced-latte', 'bumble-coffee', 'iced-latte-kz', 'bumble-coffee-kz',
  'orange-fresh', 'cranberry-tea', 'sea-buckthorn-tea', 'raspberry-tea', 'tashkent-tea', 'glintwein', 'cranberry-tea-kz'
);

DELETE FROM "Product" WHERE id IN (
  'americano-250', 'americano-350', 'americano-450',
  'cappuccino-250', 'cappuccino-350', 'cappuccino-450',
  'latte-350', 'latte-450',
  'cocoa-350', 'matcha-350', 'coffee-with-milk-350',
  'raf-peach', 'raf-pineapple-caramel', 'raf-citrus-cookie',
  'mango-passion-lemonade', 'kiwi-lime-lemonade', 'citrus-lemonade', 'mojito-lemonade', 'mango-passion-lemonade-kz',
  'iced-latte', 'bumble-coffee', 'iced-latte-kz', 'bumble-coffee-kz',
  'orange-fresh', 'cranberry-tea', 'sea-buckthorn-tea', 'raspberry-tea', 'tashkent-tea', 'glintwein', 'cranberry-tea-kz'
);

-- 2. Insert clean single products (using the base 250ml price for coffee, smallest size for others)
INSERT INTO "Product" (id, name, description, "basePrice", category, "createdAt", "updatedAt") VALUES 

-- COFFEE PRODUCTS (base price is for 250ml)
('americano', 'Американо', 'Классический американо', 690, 'COFFEE', NOW(), NOW()),
('cappuccino', 'Капучино', 'Эспрессо с взбитым молоком', 890, 'COFFEE', NOW(), NOW()),
('latte', 'Латте', 'Эспрессо с молоком', 990, 'COFFEE', NOW(), NOW()),
('flat-white', 'Флэт Уайт', 'Крепкий кофе с молоком', 890, 'COFFEE', NOW(), NOW()),
('mokko', 'Мокко', 'Кофе с шоколадом', 1190, 'COFFEE', NOW(), NOW()),

-- RAF COFFEE
('raf-peach', 'Раф Персиковый', 'Раф с персиковым сиропом', 1390, 'COFFEE', NOW(), NOW()),
('raf-pineapple-caramel', 'Раф Ананас в Карамели', 'Раф с ананасом и карамелью', 1390, 'COFFEE', NOW(), NOW()),
('raf-citrus-cookie', 'Раф Цитрусовое Печенье', 'Раф с цитрусом и печеньем', 1390, 'COFFEE', NOW(), NOW()),

-- HOT BEVERAGES
('cocoa', 'Какао', 'Горячее какао', 990, 'HOT_BEVERAGES', NOW(), NOW()),
('matcha', 'Матча', 'Матча латте', 990, 'HOT_BEVERAGES', NOW(), NOW()),
('glintwein', 'Глинтвейн', 'Горячий глинтвейн', 1090, 'HOT_BEVERAGES', NOW(), NOW()),

-- TEA
('cranberry-tea', 'Клюквенный Чай', 'Согревающий клюквенный чай', 990, 'TEA', NOW(), NOW()),
('sea-buckthorn-tea', 'Облепиховый Чай', 'Полезный облепиховый чай', 990, 'TEA', NOW(), NOW()),
('raspberry-tea', 'Малиновый Чай', 'Ароматный малиновый чай', 990, 'TEA', NOW(), NOW()),
('tashkent-tea', 'Ташкентский Чай', 'Традиционный ташкентский чай', 990, 'TEA', NOW(), NOW()),

-- COLD DRINKS
('iced-latte', 'Айс Латте', 'Холодный латте', 1390, 'COLD_DRINKS', NOW(), NOW()),
('bumble-coffee', 'Бамбл Кофе', 'Специальный холодный кофе', 1390, 'COLD_DRINKS', NOW(), NOW()),

-- LEMONADES
('mango-passion-lemonade', 'Манго-Маракуйя', 'Лимонад манго-маракуйя', 990, 'LEMONADES', NOW(), NOW()),
('kiwi-lime-lemonade', 'Киви-Лайм', 'Лимонад киви-лайм', 990, 'LEMONADES', NOW(), NOW()),
('citrus-lemonade', 'Цитрусовый', 'Цитрусовый лимонад', 990, 'LEMONADES', NOW(), NOW()),
('mojito-lemonade', 'Мохито', 'Освежающий мохито', 990, 'LEMONADES', NOW(), NOW()),

-- FRESH JUICE
('orange-fresh', 'Апельсиновый Фреш', 'Свежевыжатый апельсиновый сок', 2090, 'FRESH_JUICE', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "basePrice" = EXCLUDED."basePrice",
  category = EXCLUDED.category,
  "updatedAt" = NOW();
