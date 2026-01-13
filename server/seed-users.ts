import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// User credentials - will be saved to txt file
const users = [
  // Admin
  { email: 'admin@bluezone.com', password: 'Password1', name: 'Admin User', role: 'admin' },

  // Regular users
  { email: 'user1@example.com', password: 'User123!', name: 'Emma de Vries', role: 'user' },
  { email: 'user2@example.com', password: 'User123!', name: 'Lucas van Dijk', role: 'user' },
  { email: 'user3@example.com', password: 'User123!', name: 'Sophie Janssen', role: 'user' },
  { email: 'user4@example.com', password: 'User123!', name: 'Tim Bakker', role: 'user' },
  { email: 'user5@example.com', password: 'User123!', name: 'Lisa Vermeer', role: 'user' },

  // Company accounts
  { email: 'greenlife@company.com', password: 'Company123!', name: 'GreenLife Wellness', role: 'company' },
  { email: 'ecomarket@company.com', password: 'Company123!', name: 'Eco Market Enschede', role: 'company' },
  { email: 'sustainable@company.com', password: 'Company123!', name: 'Sustainable Solutions', role: 'company' },
  { email: 'natura@company.com', password: 'Company123!', name: 'Natura Community', role: 'company' },
  { email: 'urbangarden@company.com', password: 'Company123!', name: 'Urban Garden Co', role: 'company' }
]

async function seedUsers() {
  console.log('👥 Seeding users...\n')

  let credentialsContent = '=== BLUEZONE TEST CREDENTIALS ===\n\n'

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        newsletter: false
      }
    })

    console.log(`✅ Created ${userData.role}: ${userData.email}`)

    credentialsContent += `${userData.role.toUpperCase()}\n`
    credentialsContent += `  Email: ${userData.email}\n`
    credentialsContent += `  Password: ${userData.password}\n`
    credentialsContent += `  Name: ${userData.name}\n\n`
  }

  // Write credentials to file
  const fs = require('fs')
  fs.writeFileSync('test-credentials.txt', credentialsContent)

  console.log(`\n🎉 Successfully created ${users.length} users!`)
  console.log('📄 Credentials saved to: test-credentials.txt\n')

  // Show distribution
  const counts = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  })

  console.log('📊 User Distribution:')
  counts.forEach(({ role, _count }) => {
    console.log(`   ${role}: ${_count}`)
  })
}

seedUsers()
  .catch((e) => {
    console.error('❌ Error seeding users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
