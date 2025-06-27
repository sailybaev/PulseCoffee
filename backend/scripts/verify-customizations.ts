import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCustomizations() {
  try {
    // Get all products with their customizations
    const products = await prisma.product.findMany({
      include: {
        customizations: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`📊 Found ${products.length} products in database`);
    console.log('');

    // Group by category and show customizations
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    Object.entries(grouped).forEach(([category, items]) => {
      console.log(`🏷️  ${category} (${items.length} items):`);
      items.forEach(item => {
        console.log(`   📦 ${item.name} - ${item.basePrice} тг`);
        if (item.customizations.length > 0) {
          console.log(`      🎛️  Customizations (${item.customizations.length}):`);
          const customsByType = item.customizations.reduce((acc, custom) => {
            if (!acc[custom.type]) {
              acc[custom.type] = [];
            }
            acc[custom.type].push(custom);
            return acc;
          }, {} as Record<string, typeof item.customizations>);

          Object.entries(customsByType).forEach(([type, customs]) => {
            console.log(`         ${type}: ${customs.map(c => `${c.name} (+${c.price} тг)`).join(', ')}`);
          });
        } else {
          console.log(`      ⚠️  No customizations`);
        }
        console.log('');
      });
    });

    // Summary stats
    const totalCustomizations = products.reduce((sum, p) => sum + p.customizations.length, 0);
    const productsWithCustomizations = products.filter(p => p.customizations.length > 0).length;
    
    console.log('📈 Summary:');
    console.log(`   Total customizations: ${totalCustomizations}`);
    console.log(`   Products with customizations: ${productsWithCustomizations}/${products.length}`);
    
    // Check customization types
    const allCustomizations = products.flatMap(p => p.customizations);
    const typeStats = allCustomizations.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   Customizations by type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error verifying customizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCustomizations();
