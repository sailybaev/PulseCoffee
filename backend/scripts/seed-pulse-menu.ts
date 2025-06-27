import { PrismaClient, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPulseMenu() {
  try {
    // Create a default branch first if not exists
    const branch = await prisma.branch.upsert({
      where: { id: 'default-branch' },
      update: {},
      create: {
        id: 'default-branch',
        name: 'Main Branch',
        address: '123 Coffee Street, Almaty',
      },
    });

    console.log('Created branch:', branch);

    // Menu items based on the Pulse Coffee menu
    const products = [
      // КЛАССИКА (Classic Coffee) - with different sizes
      {
        id: 'americano-250',
        name: 'Американо',
        nameKz: 'Американо', 
        description: 'Классический американо 250мл',
        basePrice: 690,
        category: ProductCategory.COFFEE,
        size: '250мл'
      },
      {
        id: 'americano-350',
        name: 'Американо',
        nameKz: 'Американо',
        description: 'Классический американо 350мл',
        basePrice: 790,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'americano-450',
        name: 'Американо', 
        nameKz: 'Американо',
        description: 'Классический американо 450мл',
        basePrice: 890,
        category: ProductCategory.COFFEE,
        size: '450мл'
      },
      {
        id: 'cappuccino-250',
        name: 'Капучино',
        nameKz: 'Капучино',
        description: 'Капучино 250мл',
        basePrice: 890,
        category: ProductCategory.COFFEE,
        size: '250мл'
      },
      {
        id: 'cappuccino-350',
        name: 'Капучино',
        nameKz: 'Капучино', 
        description: 'Капучино 350мл',
        basePrice: 990,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'cappuccino-450',
        name: 'Капучино',
        nameKz: 'Капучино',
        description: 'Капучино 450мл',
        basePrice: 1090,
        category: ProductCategory.COFFEE,
        size: '450мл'
      },
      {
        id: 'latte-350',
        name: 'Латте',
        nameKz: 'Латте',
        description: 'Латте 350мл',
        basePrice: 990,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'latte-450',
        name: 'Латте',
        nameKz: 'Латте',
        description: 'Латте 450мл',
        basePrice: 1090,
        category: ProductCategory.COFFEE,
        size: '450мл'
      },
      {
        id: 'flat-white',
        name: 'Флэт уайт',
        nameKz: 'Флэт уайт',
        description: 'Флэт уайт 350мл',
        basePrice: 890,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'mokko',
        name: 'Мокко',
        nameKz: 'Мокко',
        description: 'Мокко 450мл',
        basePrice: 1190,
        category: ProductCategory.COFFEE,
        size: '450мл'
      },

      // НЕ КОФЕ (Not Coffee)
      {
        id: 'cocoa-350',
        name: 'Какао',
        nameKz: 'Какао',
        description: 'Горячее какао 350мл',
        basePrice: 990,
        category: ProductCategory.HOT_BEVERAGES,
        size: '350мл'
      },
      {
        id: 'matcha-350',
        name: 'Матча',
        nameKz: 'Матча',
        description: 'Матча латте 350мл',
        basePrice: 990,
        category: ProductCategory.HOT_BEVERAGES,
        size: '350мл'
      },

      // КОФЕ ЕМЕС (Coffee with Milk - Kazakh section)
      {
        id: 'coffee-with-milk-350',
        name: 'Кофе емес',
        nameKz: 'Кофе емес',
        description: 'Кофе с молоком 350мл',
        basePrice: 990,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },

      // РАФ КОФЕ (Raf Coffee)
      {
        id: 'raf-peach',
        name: 'Раф персиковый',
        nameKz: 'Шабдалы рафы',
        description: 'Раф с персиковым сиропом 350мл',
        basePrice: 1390,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'raf-pineapple-caramel',
        name: 'Раф ананас в карамели',
        nameKz: 'Ананасты післенаң рафы',
        description: 'Раф ананас в карамели 350мл',
        basePrice: 1390,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },
      {
        id: 'raf-citrus-cookie',
        name: 'Раф цитрусовое печенье',
        nameKz: 'Карамельдегі ананасты раф',
        description: 'Раф цитрусовое печенье 350мл',
        basePrice: 1390,
        category: ProductCategory.COFFEE,
        size: '350мл'
      },

      // ЛИМОНАДЫ (Lemonades)
      {
        id: 'mango-passion-lemonade',
        name: 'Манго-маракуйя',
        nameKz: 'Манго-маракуйя',
        description: 'Лимонад манго-маракуйя 500мл',
        basePrice: 990,
        category: ProductCategory.LEMONADES,
        size: '500мл'
      },
      {
        id: 'kiwi-lime-lemonade',
        name: 'Киви-лайм',
        nameKz: 'Киви-лайм',
        description: 'Лимонад киви-лайм 500мл',
        basePrice: 990,
        category: ProductCategory.LEMONADES,
        size: '500мл'
      },
      {
        id: 'citrus-lemonade',
        name: 'Цитрусовый',
        nameKz: 'Цитрусты',
        description: 'Цитрусовый лимонад 500мл',
        basePrice: 990,
        category: ProductCategory.LEMONADES,
        size: '500мл'
      },
      {
        id: 'mojito-lemonade',
        name: 'Мохито',
        nameKz: 'Мохито',
        description: 'Лимонад мохито 500мл',
        basePrice: 990,
        category: ProductCategory.LEMONADES,
        size: '500мл'
      },

      // ЛИМОНАДТАР (Lemonades in Kazakh)
      {
        id: 'mango-passion-lemonade-kz',
        name: 'Манго-маракуйя',
        nameKz: 'Манго-маракуйя',
        description: 'Лимонадтар манго-маракуйя 500мл',
        basePrice: 990,
        category: ProductCategory.LEMONADES,
        size: '500мл'
      },

      // ХОЛОДНЫЙ КОФЕ (Cold Coffee)
      {
        id: 'iced-latte',
        name: 'Айс латте',
        nameKz: 'Айс латте',
        description: 'Холодный латте 500мл',
        basePrice: 1390,
        category: ProductCategory.COLD_DRINKS,
        size: '500мл'
      },
      {
        id: 'bumble-coffee',
        name: 'Бамбл кофе',
        nameKz: 'Бамбл кофе',
        description: 'Бамбл кофе 500мл',
        basePrice: 1390,
        category: ProductCategory.COLD_DRINKS,
        size: '500мл'
      },

      // САЛҚЫН КОФЕ (Cold Coffee in Kazakh)
      {
        id: 'iced-latte-kz',
        name: 'Айс латте',
        nameKz: 'Айс латте',
        description: 'Салқын латте 500мл',
        basePrice: 1390,
        category: ProductCategory.COLD_DRINKS,
        size: '500мл'
      },
      {
        id: 'bumble-coffee-kz',
        name: 'Бамбл кофе',
        nameKz: 'Бамбл кофе', 
        description: 'Салқын бамбл кофе 500мл',
        basePrice: 1390,
        category: ProductCategory.COLD_DRINKS,
        size: '500мл'
      },

      // ФРЕШ (Fresh Juices)
      {
        id: 'orange-fresh',
        name: 'Апельсиновый фреш',
        nameKz: 'Апельсиндгі фреш',
        description: 'Свежевыжатый апельсиновый сок 350мл',
        basePrice: 2090,
        category: ProductCategory.FRESH_JUICE,
        size: '350мл'
      },

      // СОГРЕВАЮЩИЕ НАПИТКИ (Warming Beverages)
      {
        id: 'cranberry-tea',
        name: 'Клюквенный чай',
        nameKz: 'Мүжидек шайы',
        description: 'Клюквенный чай 450мл',
        basePrice: 990,
        category: ProductCategory.TEA,
        size: '450мл'
      },
      {
        id: 'sea-buckthorn-tea',
        name: 'Облепиховый чай',
        nameKz: 'Шырғанақ шайы',
        description: 'Облепиховый чай 450мл',
        basePrice: 990,
        category: ProductCategory.TEA,
        size: '450мл'
      },
      {
        id: 'raspberry-tea',
        name: 'Малиновый чай',
        nameKz: 'Тәңкүрай шайы',
        description: 'Малиновый чай 450мл',
        basePrice: 990,
        category: ProductCategory.TEA,
        size: '450мл'
      },
      {
        id: 'tashkent-tea',
        name: 'Ташкентский чай',
        nameKz: 'Ташкент шайы',
        description: 'Ташкентский чай 450мл',
        basePrice: 990,
        category: ProductCategory.TEA,
        size: '450мл'
      },
      {
        id: 'glintwein',
        name: 'Глинтвейн',
        nameKz: 'Глинтвейн',
        description: 'Глинтвейн 450мл',
        basePrice: 1090,
        category: ProductCategory.HOT_BEVERAGES,
        size: '450мл'
      },

      // ЖЫЛЫPATHYN СУСЫНДАР (Warming Beverages in Kazakh)
      {
        id: 'cranberry-tea-kz',
        name: 'Мүжидек шайы',
        nameKz: 'Мүжидек шайы',
        description: 'Жылыpathын мүжидек шайы 450мл',
        basePrice: 990,
        category: ProductCategory.TEA,
        size: '450мл'
      }
    ];

    console.log(`Starting to seed ${products.length} products...`);

    for (const product of products) {
      // Remove nameKz and size from the product data as they're not in the schema
      const { nameKz, size, ...productData } = product;
      
      const createdProduct = await prisma.product.upsert({
        where: { id: product.id },
        update: productData,
        create: productData,
      });
      
      console.log(`✅ Created/Updated product: ${createdProduct.name} (${product.size || 'no size'})`);
    }

    console.log('✅ Pulse Coffee menu seeded successfully!');
    console.log(`📊 Total products: ${products.length}`);
    
    // Show summary by category
    const categorySummary = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Products by category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });

  } catch (error) {
    console.error('❌ Error seeding Pulse Coffee menu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPulseMenu();
