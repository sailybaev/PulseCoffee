import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMenu() {
  try {
    // Get all products with count by category
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
        category: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`📊 Total products in database: ${products.length}`);
    console.log('');

    // Group by category
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    // Display by category
    Object.entries(grouped).forEach(([category, items]) => {
      console.log(`🏷️  ${category} (${items.length} items):`);
      items.forEach(item => {
        console.log(`   • ${item.name} - ${item.basePrice} тг`);
      });
      console.log('');
    });

    // Check if we have all the main categories
    const expectedCategories = ['COFFEE', 'TEA', 'COLD_DRINKS', 'HOT_BEVERAGES', 'LEMONADES', 'FRESH_JUICE', 'ADDITIVES'];
    const presentCategories = Object.keys(grouped);
    
    console.log('✅ Categories check:');
    expectedCategories.forEach(cat => {
      const present = presentCategories.includes(cat);
      console.log(`   ${present ? '✅' : '❌'} ${cat}`);
    });

  } catch (error) {
    console.error('❌ Error verifying menu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMenu();
