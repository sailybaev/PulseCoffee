import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listProducts() {
  const products = await prisma.product.findMany();
  console.log('All products in database:');
  products.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}`));
  await prisma.$disconnect();
}

listProducts();
