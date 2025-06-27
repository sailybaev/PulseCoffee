import { PrismaClient, CustomizationType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPulseCustomizations() {
  try {
    // Get all coffee products for customizations
    const coffeeProducts = await prisma.product.findMany({
      where: { category: 'COFFEE' }
    });

    console.log(`Found ${coffeeProducts.length} coffee products to add customizations to`);

    for (const product of coffeeProducts) {
      console.log(`Adding customizations for: ${product.name}`);

      // Size options - based on the menu, coffee comes in different sizes
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: '250мл',
            type: CustomizationType.CUP_SIZE,
            price: 0, // Base price
          },
          {
            productId: product.id,
            name: '350мл',
            type: CustomizationType.CUP_SIZE,
            price: 100, // Additional price for medium
          },
          {
            productId: product.id,
            name: '450мл',
            type: CustomizationType.CUP_SIZE,
            price: 200, // Additional price for large
          }
        ],
        skipDuplicates: true
      });

      // Milk alternatives - from the ДОБАВКИ section
      if (!product.id.includes('americano') && !product.id.includes('espresso')) {
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
              price: 490, // From menu: Альтернативное молоко 490 KZT
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
          ],
          skipDuplicates: true
        });
      }

      // Syrups - from the menu ДОБАВКИ section
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Ванильный сироп',
            type: CustomizationType.SYRUP,
            price: 100, // From menu: Сироп 100 KZT
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
          },
          {
            productId: product.id,
            name: 'Клубничный сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          },
          {
            productId: product.id,
            name: 'Лавандовый сироп',
            type: CustomizationType.SYRUP,
            price: 100,
          }
        ],
        skipDuplicates: true
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
            price: 490, // From menu: Декаф 490 KZT
          },
          {
            productId: product.id,
            name: 'Мед',
            type: CustomizationType.OTHER,
            price: 100, // From menu: Молоко/Мед 100 KZT
          },
          {
            productId: product.id,
            name: 'Экстра горячий',
            type: CustomizationType.TEMPERATURE,
            price: 0,
          },
          {
            productId: product.id,
            name: 'Теплый',
            type: CustomizationType.TEMPERATURE,
            price: 0,
          }
        ],
        skipDuplicates: true
      });
    }

    // Add customizations for tea products
    const teaProducts = await prisma.product.findMany({
      where: { category: 'TEA' }
    });

    for (const product of teaProducts) {
      console.log(`Adding customizations for tea: ${product.name}`);

      // Tea sweeteners and additives
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
        ],
        skipDuplicates: true
      });
    }

    // Add customizations for hot beverages
    const hotBeverages = await prisma.product.findMany({
      where: { category: 'HOT_BEVERAGES' }
    });

    for (const product of hotBeverages) {
      console.log(`Adding customizations for hot beverage: ${product.name}`);

      if (product.name.includes('Какао')) {
        // Cocoa customizations
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
          ],
          skipDuplicates: true
        });
      }

      if (product.name.includes('Матча')) {
        // Matcha customizations
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
              name: 'Миндальное молоко',
              type: CustomizationType.MILK_TYPE,
              price: 490,
            }
          ],
          skipDuplicates: true
        });
      }
    }

    console.log('✅ Pulse Coffee customizations seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding Pulse customizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPulseCustomizations();
