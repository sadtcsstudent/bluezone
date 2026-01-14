import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEventCategories() {
  console.log('Checking for events without categories...');

  // Get the "Other" category
  let otherCategory = await prisma.category.findFirst({
    where: { name: 'Other' }
  });

  if (!otherCategory) {
    // Create "Other" category if it doesn't exist
    otherCategory = await prisma.category.create({
      data: {
        name: 'Other',
        icon: 'Tag',
        color: '#64748b',
        order: 999
      }
    });
    console.log('Created "Other" category');
  }

  // Count events without categories
  const eventsWithoutCategory = await prisma.event.count({
    where: {
      categoryId: null
    }
  });

  console.log(`Found ${eventsWithoutCategory} events without categories`);

  if (eventsWithoutCategory > 0) {
    // Update all events without a category to use "Other"
    const result = await prisma.event.updateMany({
      where: {
        categoryId: null
      },
      data: {
        categoryId: otherCategory.id
      }
    });

    console.log(`✓ Updated ${result.count} events to use "Other" category`);
  } else {
    console.log('✓ All events already have categories');
  }
}

fixEventCategories()
  .catch((e) => {
    console.error('Error fixing event categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
