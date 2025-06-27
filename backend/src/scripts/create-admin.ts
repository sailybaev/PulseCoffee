import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser(email: string, password: string, name: string, phoneNumber: string) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('Admin user already exists with this email');
      return;
    }

    // Check if phone number is already in use
    const existingPhone = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      console.log('Phone number is already registered');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        phoneNumber,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email, password, name, and phone number from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];
const phoneNumber = process.argv[5];

if (!email || !password || !name || !phoneNumber) {
  console.log('Usage: ts-node create-admin.ts <email> <password> <name> <phoneNumber>');
  process.exit(1);
}

createAdminUser(email, password, name, phoneNumber); 