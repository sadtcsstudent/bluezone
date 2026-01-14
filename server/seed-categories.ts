import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Sports & Fitness', icon: 'Dumbbell', color: '#f59e0b' },
  { name: 'Arts & Culture', icon: 'Palette', color: '#8b5cf6' },
  { name: 'Music & Entertainment', icon: 'Music', color: '#ec4899' },
  { name: 'Food & Drink', icon: 'UtensilsCrossed', color: '#ef4444' },
  { name: 'Education & Learning', icon: 'GraduationCap', color: '#3b82f6' },
  { name: 'Technology', icon: 'Laptop', color: '#6366f1' },
  { name: 'Health & Wellness', icon: 'Heart', color: '#10b981' },
  { name: 'Outdoor & Nature', icon: 'Trees', color: '#22c55e' },
  { name: 'Business & Networking', icon: 'Briefcase', color: '#0ea5e9' },
  { name: 'Community & Social', icon: 'Users', color: '#14b8a6' },
  { name: 'Family & Kids', icon: 'Baby', color: '#f97316' },
  { name: 'Other', icon: 'Tag', color: '#64748b' }
];

async function seedCategories() {
  console.log('Seeding categories...');

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log(`✓ Seeded ${defaultCategories.length} categories`);
}

seedCategories()
  .catch((e) => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
