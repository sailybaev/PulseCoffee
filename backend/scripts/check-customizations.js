const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCustomizations() {
  try {
    // Get customizations for mokko and cappuccino
    const customizations = await prisma.productCustomization.findMany({
      where: {
        productId: { in: ['mokko', 'cappuccino'] }
      },
      orderBy: [
        { productId: 'asc' },
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log('ProductCustomizations for mokko and cappuccino:');
    customizations.forEach(c => {
      console.log(`ID: ${c.id}, Product: ${c.productId}, Type: ${c.type}, Name: ${c.name}, Price: ${c.price}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomizations();
