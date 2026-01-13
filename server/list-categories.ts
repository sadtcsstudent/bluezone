import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { events: true }
      }
    }
  });

  console.log('\n📋 Categories in Database:\n');
  console.log('┌────────────────────────────┬──────────────┬─────────┬───────┬────────┐');
  console.log('│ Name                       │ Icon         │ Color   │ Order │ Events │');
  console.log('├────────────────────────────┼──────────────┼─────────┼───────┼────────┤');

  for (const cat of categories) {
    const name = cat.name.padEnd(26);
    const icon = cat.icon.padEnd(12);
    const color = cat.color.padEnd(7);
    const order = String(cat.order).padEnd(5);
    const events = String(cat._count.events).padEnd(6);
    console.log(`│ ${name} │ ${icon} │ ${color} │ ${order} │ ${events} │`);
  }

  console.log('└────────────────────────────┴──────────────┴─────────┴───────┴────────┘');
  console.log(`\nTotal: ${categories.length} categories\n`);
}

listCategories()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
