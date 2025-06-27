-- Add new product categories to existing enum if not already present
-- This script adds the new categories required for the Pulse Coffee menu

-- Add new enum values (PostgreSQL 10+ syntax)
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'COLD_DRINKS';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'FRESH_JUICE';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'HOT_BEVERAGES';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'LEMONADES';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'ADDITIVES';

-- Insert Pulse Coffee menu items
INSERT INTO "Product" (id, name, description, "basePrice", category, "createdAt", "updatedAt") VALUES 

-- КЛАССИКА (Classic Coffee)
('americano-250', 'Американо', 'Классический американо 250мл', 690, 'COFFEE', NOW(), NOW()),
('americano-350', 'Американо', 'Классический американо 350мл', 790, 'COFFEE', NOW(), NOW()),
('americano-450', 'Американо', 'Классический американо 450мл', 890, 'COFFEE', NOW(), NOW()),
('cappuccino-250', 'Капучино', 'Капучино 250мл', 890, 'COFFEE', NOW(), NOW()),
('cappuccino-350', 'Капучино', 'Капучино 350мл', 990, 'COFFEE', NOW(), NOW()),
('cappuccino-450', 'Капучино', 'Капучино 450мл', 1090, 'COFFEE', NOW(), NOW()),
('latte-350', 'Латте', 'Латте 350мл', 990, 'COFFEE', NOW(), NOW()),
('latte-450', 'Латте', 'Латте 450мл', 1090, 'COFFEE', NOW(), NOW()),
('flat-white', 'Флэт уайт', 'Флэт уайт 350мл', 890, 'COFFEE', NOW(), NOW()),
('mokko', 'Мокко', 'Мокко 450мл', 1190, 'COFFEE', NOW(), NOW()),

-- НЕ КОФЕ (Not Coffee)
('cocoa-350', 'Какао', 'Горячее какао 350мл', 990, 'HOT_BEVERAGES', NOW(), NOW()),
('matcha-350', 'Матча', 'Матча латте 350мл', 990, 'HOT_BEVERAGES', NOW(), NOW()),

-- КОФЕ ЕМЕС (Coffee with Milk - Kazakh section)
('coffee-with-milk-350', 'Кофе емес', 'Кофе с молоком 350мл', 990, 'COFFEE', NOW(), NOW()),

-- РАФ КОФЕ (Raf Coffee)
('raf-peach', 'Раф персиковый', 'Раф с персиковым сиропом 350мл', 1390, 'COFFEE', NOW(), NOW()),
('raf-pineapple-caramel', 'Раф ананас в карамели', 'Раф ананас в карамели 350мл', 1390, 'COFFEE', NOW(), NOW()),
('raf-citrus-cookie', 'Раф цитрусовое печенье', 'Раф цитрусовое печенье 350мл', 1390, 'COFFEE', NOW(), NOW()),

-- ЛИМОНАДЫ (Lemonades)
('mango-passion-lemonade', 'Манго-маракуйя', 'Лимонад манго-маракуйя 500мл', 990, 'LEMONADES', NOW(), NOW()),
('kiwi-lime-lemonade', 'Киви-лайм', 'Лимонад киви-лайм 500мл', 990, 'LEMONADES', NOW(), NOW()),
('citrus-lemonade', 'Цитрусовый', 'Цитрусовый лимонад 500мл', 990, 'LEMONADES', NOW(), NOW()),
('mojito-lemonade', 'Мохито', 'Лимонад мохито 500мл', 990, 'LEMONADES', NOW(), NOW()),

-- ЛИМОНАДТАР (Lemonades in Kazakh)
('mango-passion-lemonade-kz', 'Манго-маракуйя', 'Лимонадтар манго-маракуйя 500мл', 990, 'LEMONADES', NOW(), NOW()),

-- ХОЛОДНЫЙ КОФЕ (Cold Coffee)
('iced-latte', 'Айс латте', 'Холодный латте 500мл', 1390, 'COLD_DRINKS', NOW(), NOW()),
('bumble-coffee', 'Бамбл кофе', 'Бамбл кофе 500мл', 1390, 'COLD_DRINKS', NOW(), NOW()),

-- САЛҚЫН КОФЕ (Cold Coffee in Kazakh)
('iced-latte-kz', 'Айс латте', 'Салқын латте 500мл', 1390, 'COLD_DRINKS', NOW(), NOW()),
('bumble-coffee-kz', 'Бамбл кофе', 'Салқын бамбл кофе 500мл', 1390, 'COLD_DRINKS', NOW(), NOW()),

-- ФРЕШ (Fresh Juices)
('orange-fresh', 'Апельсиновый фреш', 'Свежевыжатый апельсиновый сок 350мл', 2090, 'FRESH_JUICE', NOW(), NOW()),

-- СОГРЕВАЮЩИЕ НАПИТКИ (Warming Beverages)
('cranberry-tea', 'Клюквенный чай', 'Клюквенный чай 450мл', 990, 'TEA', NOW(), NOW()),
('sea-buckthorn-tea', 'Облепиховый чай', 'Облепиховый чай 450мл', 990, 'TEA', NOW(), NOW()),
('raspberry-tea', 'Малиновый чай', 'Малиновый чай 450мл', 990, 'TEA', NOW(), NOW()),
('tashkent-tea', 'Ташкентский чай', 'Ташкентский чай 450мл', 990, 'TEA', NOW(), NOW()),
('glintwein', 'Глинтвейн', 'Глинтвейн 450мл', 1090, 'HOT_BEVERAGES', NOW(), NOW()),

-- ЖЫЛЫPATHYN СУСЫНДАР (Warming Beverages in Kazakh)
('cranberry-tea-kz', 'Мүжидек шайы', 'Жылыpathын мүжидек шайы 450мл', 990, 'TEA', NOW(), NOW())

-- Use ON CONFLICT to avoid duplicate key errors if items already exist
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "basePrice" = EXCLUDED."basePrice",
  category = EXCLUDED.category,
  "updatedAt" = NOW();
