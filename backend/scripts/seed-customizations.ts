import { PrismaClient, CustomizationType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCustomizations() {
  try {
    // Get the coffee products
    const coffeeProducts = await prisma.product.findMany({
      where: { category: 'COFFEE' }
    });

    console.log('Found coffee products:', coffeeProducts.map(p => p.name));

    // Create size customizations for all coffee products
    for (const product of coffeeProducts) {
      // Size options
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Small',
            type: CustomizationType.CUP_SIZE,
            price: 0,
          },
          {
            productId: product.id,
            name: 'Medium',
            type: CustomizationType.CUP_SIZE,
            price: 200,
          },
          {
            productId: product.id,
            name: 'Large',
            type: CustomizationType.CUP_SIZE,
            price: 400,
          }
        ]
      });

      // Milk options (for all coffee products except espresso)
      if (product.id !== 'espresso') {
        await prisma.productCustomization.createMany({
          data: [
            {
              productId: product.id,
              name: 'Whole Milk',
              type: CustomizationType.MILK_TYPE,
              price: 0,
            },
            {
              productId: product.id,
              name: 'Oat Milk',
              type: CustomizationType.MILK_TYPE,
              price: 100,
            },
            {
              productId: product.id,
              name: 'Almond Milk',
              type: CustomizationType.MILK_TYPE,
              price: 100,
            },
            {
              productId: product.id,
              name: 'Soy Milk',
              type: CustomizationType.MILK_TYPE,
              price: 100,
            }
          ]
        });
      }

      // Extra shots
      await prisma.productCustomization.createMany({
        data: [
          {
            productId: product.id,
            name: 'Extra Shot',
            type: CustomizationType.EXTRA_SHOT,
            price: 150,
          },
          {
            productId: product.id,
            name: 'Decaf',
            type: CustomizationType.OTHER,
            price: 0,
          },
          {
            productId: product.id,
            name: 'Extra Hot',
            type: CustomizationType.TEMPERATURE,
            price: 0,
          }
        ]
      });

      console.log(`Created customizations for ${product.name}`);
    }

    console.log('✅ Customizations seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding customizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCustomizations();
