import { PrismaClient, CustomizationType, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProperCustomizations() {
  try {
    console.log('🧹 Cleaning existing customizations...');
    await prisma.productCustomization.deleteMany();

    console.log('🎛️ Adding proper customizations...');

    // Get all products
    const coffeeProducts = await prisma.product.findMany({
      where: { category: ProductCategory.COFFEE }
    });

    const teaProducts = await prisma.product.findMany({
      where: { category: ProductCategory.TEA }
    });

    const hotBeverages = await prisma.product.findMany({
      where: { category: ProductCategory.HOT_BEVERAGES }
    });

    const coldDrinks = await prisma.product.findMany({
      where: { category: ProductCategory.COLD_DRINKS }
    });

    const lemonades = await prisma.product.findMany({
      where: { category: ProductCategory.LEMONADES }
    });

    const freshJuices = await prisma.product.findMany({
      where: { category: ProductCategory.FRESH_JUICE }
    });

    // COFFEE CUSTOMIZATIONS
    for (const product of coffeeProducts) {
      console.log(`☕ Adding customizations for coffee: ${product.name}`);

      // Cup sizes for coffee (base price is for 250ml)
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '250мл',
            type: CustomizationType.CUP_SIZE,
            price: 0, // Base size, no additional cost
          },
          {
            productId: product.id,
            name: '350мл',
            type: CustomizationType.CUP_SIZE,
            price: 100, // +100 KZT for medium
          },
          {
            productId: product.id,
            name: '450мл',
            type: CustomizationType.CUP_SIZE,
            price: 200, // +200 KZT for large
          }
        ]
      });

      // Milk types (not for americano)
      if (!product.id.includes('americano')) {
        await prisma.productCustomization.createMany({
          data: [
            {
              productId: product.id,
              name: 'Обычное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 0,
            },
            {
              productId: product.id,
              name: 'Овсяное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 490,
            },
            {
              productId: product.id,
              name: 'Миндальное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 490,
            },
            {
              productId: product.id,
              name: 'Соевое молоко',
              type: CustomizationType.MILK_TYPE,
              price: 490,
            }
          ]
        });
      }

      // Syrups
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Ванильный сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          },
          {
            productId: product.id,
            name: 'Карамельный сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          },
          {
            productId: product.id,
            name: 'Персиковый сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          }
        ]
      });

      // Extra shots and other options
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Дополнительный шот',
            type: CustomizationType.EXTRA_SHOT,
            price: 150,
          },
          {
            productId: product.id,
            name: 'Декаф',
            type: CustomizationType.OTHER,
            price: 0, // No additional cost for decaf
          },
          {
            productId: product.id,
            name: 'Экстра горячий',
            type: CustomizationType.TEMPERATURE,
            price: 0,
          }
        ]
      });
    }

    // TEA CUSTOMIZATIONS
    for (const product of teaProducts) {
      console.log(`🍵 Adding customizations for tea: ${product.name}`);

      // Tea sizes (base is 450ml, no smaller sizes)
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '450мл',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          }
        ]
      });

      // Tea additives
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Мед',
            type: CustomizationType.OTHER,
            price: 100,
          },
          {
            productId: product.id,
            name: 'Лимон',
            type: CustomizationType.OTHER,
            price: 50,
          },
          {
            productId: product.id,
            name: 'Молоко',
            type: CustomizationType.MILK_TYPE,
            price: 100,
          }
        ]
      });
    }

    // HOT BEVERAGES CUSTOMIZATIONS
    for (const product of hotBeverages) {
      console.log(`🔥 Adding customizations for hot beverage: ${product.name}`);

      // Standard size for hot beverages
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '350мл',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          }
        ]
      });

      if (product.name.includes('Какао')) {
        await prisma.productCustomization.createMany({
          data: [
            {
              productId: product.id,
              name: 'Маршмеллоу',
              type: CustomizationType.OTHER,
              price: 100,
            },
            {
              productId: product.id,
              name: 'Взбитые сливки',
              type: CustomizationType.OTHER,
              price: 150,
            }
          ]
        });
      }

      if (product.name.includes('Матча')) {
        await prisma.productCustomization.createMany({
          data: [
            {
              productId: product.id,
              name: 'Овсяное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 490,
            },
            {
              productId: product.id,
              name: 'Обычное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 0,
            }
          ]
        });
      }
    }

    // COLD DRINKS CUSTOMIZATIONS
    for (const product of coldDrinks) {
      console.log(`🧊 Adding customizations for cold drink: ${product.name}`);

      // Cold drinks size
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '500мл',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          }
        ]
      });

      // Milk options for iced coffee
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Обычное молоко',
            type: CustomizationType.MILK_TYPE,
            price: 0,
          },
          {
            productId: product.id,
            name: 'Овсяное молоко',
            type: CustomizationType.MILK_TYPE,
            price: 490,
          }
        ]
      });

      // Syrups for cold drinks
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Ванильный сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          },
          {
            productId: product.id,
            name: 'Карамельный сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          }
        ]
      });
    }

    // LEMONADES CUSTOMIZATIONS
    for (const product of lemonades) {
      console.log(`🍋 Adding customizations for lemonade: ${product.name}`);

      // Lemonade size
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '500мл',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          }
        ]
      });
    }

    // FRESH JUICE CUSTOMIZATIONS
    for (const product of freshJuices) {
      console.log(`🍊 Adding customizations for fresh juice: ${product.name}`);

      // Fresh juice size
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '350мл',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          }
        ]
      });
    }

    console.log('✅ Proper customizations seeded successfully!');

    // Show summary
    const totalCustomizations = await prisma.productCustomization.count();
    const customizationsByType = await prisma.productCustomization.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    console.log(`📊 Total customizations: ${totalCustomizations}`);
    console.log('📈 By type:');
    customizationsByType.forEach(item => {
      console.log(`   ${item.type}: ${item._count.id}`);
    });

  } catch (error) {
    console.error('❌ Error seeding proper customizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProperCustomizations();
