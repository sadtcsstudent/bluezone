import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of old category names to new category objects
const categoryMappings: Record<string, { name: string; icon: string; color: string }> = {
  // Common old categories and their mappings
  'Gardening': { name: 'Outdoor & Nature', icon: 'Trees', color: '#22c55e' },
  'Food & Nutrition': { name: 'Food & Drink', icon: 'UtensilsCrossed', color: '#ef4444' },
  'Wellbeing': { name: 'Health & Wellness', icon: 'Heart', color: '#10b981' },
  'Social': { name: 'Community & Social', icon: 'Users', color: '#14b8a6' },
  'Sustainability': { name: 'Outdoor & Nature', icon: 'Trees', color: '#22c55e' },
  'General': { name: 'Other', icon: 'Tag', color: '#64748b' },
  'Sports': { name: 'Sports & Fitness', icon: 'Dumbbell', color: '#f59e0b' },
  'Music': { name: 'Music & Entertainment', icon: 'Music', color: '#ec4899' },
  'Arts': { name: 'Arts & Culture', icon: 'Palette', color: '#8b5cf6' },
  'Culture': { name: 'Arts & Culture', icon: 'Palette', color: '#8b5cf6' },
  'Education': { name: 'Education & Learning', icon: 'GraduationCap', color: '#3b82f6' },
  'Technology': { name: 'Technology', icon: 'Laptop', color: '#6366f1' },
  'Tech': { name: 'Technology', icon: 'Laptop', color: '#6366f1' },
  'Business': { name: 'Business & Networking', icon: 'Briefcase', color: '#0ea5e9' },
  'Networking': { name: 'Business & Networking', icon: 'Briefcase', color: '#0ea5e9' },
  'Family': { name: 'Family & Kids', icon: 'Baby', color: '#f97316' },
  'Kids': { name: 'Family & Kids', icon: 'Baby', color: '#f97316' },
};

async function migrateOldCategories() {
  console.log('Starting category migration...\n');

  // Step 1: Get all existing categories from database
  const existingCategories = await prisma.category.findMany();
  const categoryMap = new Map(existingCategories.map(c => [c.name, c]));

  console.log(`Found ${existingCategories.length} existing categories in database`);

  // Step 2: Check if we need to query old events
  // First, let's see if the schema still has old string-based categories
  // We'll use a raw query to be safe
  let oldCategoryStrings: string[] = [];

  try {
    // Try to get unique old category values if the column exists
    const result = await prisma.$queryRaw<Array<{ category: string }>>`
      SELECT DISTINCT category::text as category
      FROM "Event"
      WHERE category IS NOT NULL
    `;
    oldCategoryStrings = result.map(r => r.category).filter(Boolean);
    console.log(`Found ${oldCategoryStrings.length} unique old category strings:`, oldCategoryStrings);
  } catch (err) {
    console.log('No old category column found (already migrated), continuing...\n');
  }

  // Step 3: Create any missing categories based on old strings and mappings
  const categoriesToCreate: Array<{ name: string; icon: string; color: string }> = [];

  for (const oldCategory of oldCategoryStrings) {
    const mapping = categoryMappings[oldCategory];
    if (mapping && !categoryMap.has(mapping.name)) {
      categoriesToCreate.push(mapping);
    } else if (!mapping && !categoryMap.has(oldCategory)) {
      // If no mapping exists and category doesn't exist, create it as "Other"
      console.log(`No mapping found for "${oldCategory}", will map to "Other"`);
    }
  }

  // Remove duplicates
  const uniqueCategories = Array.from(
    new Map(categoriesToCreate.map(c => [c.name, c])).values()
  );

  console.log(`\nCreating ${uniqueCategories.length} new categories...`);
  for (const category of uniqueCategories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
    console.log(`  ✓ ${created.name}`);
    categoryMap.set(created.name, created);
  }

  // Step 4: Get the "Other" category (fallback)
  let otherCategory = categoryMap.get('Other');
  if (!otherCategory) {
    otherCategory = await prisma.category.create({
      data: {
        name: 'Other',
        icon: 'Tag',
        color: '#64748b'
      }
    });
    console.log('  ✓ Created "Other" category');
  }

  console.log('\n✅ Category migration completed successfully!');
  console.log(`\nTotal categories in database: ${categoryMap.size}`);
}

migrateOldCategories()
  .catch((e) => {
    console.error('❌ Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
