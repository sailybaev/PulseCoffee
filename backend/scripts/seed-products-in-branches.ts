import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductsInBranches() {
  try {
    // Get all products and branches
    const products = await prisma.product.findMany();
    const branches = await prisma.branch.findMany();

    console.log(`📦 Adding ${products.length} products to ${branches.length} branches...`);

    let addedCount = 0;

    for (const branch of branches) {
      for (const product of products) {
        // Create ProductInBranch entry with the base price
        await prisma.productInBranch.upsert({
          where: {
            productId_branchId: {
              productId: product.id,
              branchId: branch.id
            }
          },
          update: {
            price: product.basePrice,
            isAvailable: true,
            updatedAt: new Date()
          },
          create: {
            id: `${product.id}-${branch.id}`,
            productId: product.id,
            branchId: branch.id,
            price: product.basePrice,
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        addedCount++;
      }
      console.log(`✅ Added products to branch: ${branch.name}`);
    }

    console.log(`🎉 Successfully linked ${addedCount} product-branch combinations!`);

  } catch (error) {
    console.error('❌ Error seeding products in branches:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProductsInBranches();
