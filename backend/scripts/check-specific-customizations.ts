import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCustomizations() {
  try {
    const customizations = await prisma.productCustomization.findMany({
      where: { productId: { in: ['mokko', 'cappuccino'] } },
      include: { product: true }
    });
    
    console.log('ProductCustomizations for mokko and cappuccino:');
    customizations.forEach(c => {
      console.log(`ID: ${c.id}, Product: ${c.product.name}, Type: ${c.type}, Name: ${c.name}, Price: ${c.price}`);
    });
    
    // Also check all products
    const products = await prisma.product.findMany({
      where: { id: { in: ['mokko', 'cappuccino'] } }
    });
    
    console.log('\nProducts:');
    products.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomizations();
