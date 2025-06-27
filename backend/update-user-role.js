import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: {
        phoneNumber: '+1234567891'
      },
      data: {
        role: 'BARISTA'
      }
    });
    
    console.log('Updated user:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
