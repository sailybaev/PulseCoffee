const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminAndBarista() {
  try {
    // Hash password for both users
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@pulsecoffee.com',
        phoneNumber: '+77771234567',
        passwordHash: passwordHash,
        role: 'ADMIN',
        branchId: 'default-branch' // Assign to main branch
      }
    });

    console.log('✅ Admin user created:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      branchId: admin.branchId
    });

    // Create Barista User
    const barista = await prisma.user.create({
      data: {
        name: 'Main Barista',
        email: 'barista@pulsecoffee.com',
        phoneNumber: '+77771234568',
        passwordHash: passwordHash,
        role: 'BARISTA',
        branchId: 'default-branch' // Assign to main branch
      }
    });

    console.log('✅ Barista user created:', {
      id: barista.id,
      name: barista.name,
      email: barista.email,
      phoneNumber: barista.phoneNumber,
      role: barista.role,
      branchId: barista.branchId
    });

    console.log('\n📋 Login credentials for both users:');
    console.log('Password: admin123');
    console.log('Admin Phone: +77771234567');
    console.log('Barista Phone: +77771234568');

  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ User with this email or phone number already exists');
    } else {
      console.error('❌ Error creating users:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAndBarista();
