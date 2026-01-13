import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('Creating admin account...');

  const email = 'admin@bluezone.com';
  const password = 'Password1';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('❌ User with email admin@bluezone.com already exists!');

    // Update to admin role if not already
    if (existingUser.role !== 'admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      console.log('✅ Updated existing user to admin role');
    } else {
      console.log('ℹ️  User is already an admin');
    }

    return;
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      location: 'Enschede, Netherlands',
      bio: 'Platform Administrator',
      interests: ['Community', 'Sustainability'],
      newsletter: true
    }
  });

  console.log('✅ Admin account created successfully!');
  console.log('\nLogin Credentials:');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

createAdmin()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
