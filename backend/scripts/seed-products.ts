import { PrismaClient, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    // Create a default branch first
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

    // Create sample products
    const products = [
      {
        id: 'espresso',
        name: 'Espresso',
        description: 'Rich and bold espresso shot',
        basePrice: 800,
        category: ProductCategory.COFFEE,
      },
      {
        id: 'americano',
        name: 'Americano', 
        description: 'Espresso with hot water',
        basePrice: 1000,
        category: ProductCategory.COFFEE,
      },
      {
        id: 'cappuccino',
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        basePrice: 1300,
        category: ProductCategory.COFFEE,
      },
      {
        id: 'latte',
        name: 'Latte',
        description: 'Espresso with steamed milk',
        basePrice: 1400,
        category: ProductCategory.COFFEE,
      },
      {
        id: 'croissant',
        name: 'Croissant',
        description: 'Buttery, flaky croissant',
        basePrice: 900,
        category: ProductCategory.PASTRY,
      },
    ];

    for (const product of products) {
      const createdProduct = await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
      console.log('Created/Updated product:', createdProduct.name);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
