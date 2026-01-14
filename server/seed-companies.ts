import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const companies = [
  {
    email: 'greenlife@example.com',
    password: 'GreenLife123!',
    name: 'GreenLife Wellness',
    description: 'Promoting healthy living and sustainable practices in our community'
  },
  {
    email: 'activefit@example.com',
    password: 'ActiveFit123!',
    name: 'ActiveFit Center',
    description: 'Your local fitness and wellness hub for all ages'
  },
  {
    email: 'artscollective@example.com',
    password: 'ArtsCollective123!',
    name: 'Community Arts Collective',
    description: 'Bringing creative expression and culture to the community'
  },
  {
    email: 'techstartup@example.com',
    password: 'TechStartup123!',
    name: 'Tech Innovators Hub',
    description: 'Connecting local tech enthusiasts and entrepreneurs'
  },
  {
    email: 'familyfirst@example.com',
    password: 'FamilyFirst123!',
    name: 'Family First Activities',
    description: 'Creating memorable experiences for families and children'
  }
];

const eventTemplates = [
  { title: 'Morning Yoga Session', category: 'Health & Wellness', hours: 9 },
  { title: 'Community Garden Workshop', category: 'Outdoor & Nature', hours: 10 },
  { title: 'Tech Networking Mixer', category: 'Technology', hours: 18 },
  { title: 'Family Movie Night', category: 'Family & Kids', hours: 19 },
  { title: 'Art Exhibition Opening', category: 'Arts & Culture', hours: 17 },
  { title: 'Cooking Class: Healthy Meals', category: 'Food & Drink', hours: 15 },
  { title: 'Business Networking Breakfast', category: 'Business & Networking', hours: 8 },
  { title: 'Live Music Performance', category: 'Music & Entertainment', hours: 20 },
  { title: 'Fitness Bootcamp', category: 'Sports & Fitness', hours: 6 },
  { title: 'Book Club Meeting', category: 'Education & Learning', hours: 18 },
  { title: 'Sustainability Workshop', category: 'Outdoor & Nature', hours: 14 },
  { title: 'Kids Craft Session', category: 'Family & Kids', hours: 11 },
  { title: 'Community Social Mixer', category: 'Community & Social', hours: 17 },
  { title: 'Meditation & Mindfulness', category: 'Health & Wellness', hours: 7 },
  { title: 'Photography Walk', category: 'Arts & Culture', hours: 16 }
];

const descriptions = [
  'Join us for an engaging and interactive session designed to bring our community together.',
  'A wonderful opportunity to learn, connect, and grow with like-minded individuals.',
  'Experience something special as we create lasting memories and meaningful connections.',
  'Don\'t miss this exciting event that promises fun, learning, and community building.',
  'Come together with neighbors and friends for a memorable experience.',
  'An enriching activity suitable for all skill levels and backgrounds.',
  'Discover new perspectives and build connections in a welcoming environment.',
  'Perfect for anyone looking to expand their horizons and meet new people.',
  'A hands-on experience that will inspire and energize you.',
  'Join our growing community for this can\'t-miss event.',
  'Bring your enthusiasm and curiosity to this engaging gathering.',
  'An opportunity to make a positive impact while having fun.',
  'Connect with passionate individuals who share your interests.',
  'Experience the joy of community through this special event.',
  'A carefully curated experience designed with you in mind.'
];

const locations = [
  'Community Center, Enschede',
  'Central Park, Enschede',
  'Public Library, Enschede',
  'Sports Complex, Enschede',
  'Art Gallery, Enschede',
  'Town Square, Enschede',
  'Recreation Center, Enschede',
  'Botanical Garden, Enschede',
  'University Campus, Enschede',
  'Cultural Center, Enschede'
];

async function seedCompanies() {
  console.log('🌱 Starting company and event seeding...\n');

  // Get all categories
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.name, c.id]));

  console.log(`Found ${categories.length} categories\n`);

  for (const company of companies) {
    console.log(`Creating company: ${company.name}...`);

    // Hash password
    const hashedPassword = await bcrypt.hash(company.password, 10);

    // Create company user
    const user = await prisma.user.upsert({
      where: { email: company.email },
      update: {},
      create: {
        email: company.email,
        password: hashedPassword,
        name: company.name,
        role: 'company',
        bio: company.description
      }
    });

    console.log(`  ✓ Created company account`);

    // Create 15 events for this company
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const template = eventTemplates[i % eventTemplates.length];
      const categoryId = categoryMap.get(template.category);

      if (!categoryId) {
        console.log(`  ⚠ Category not found: ${template.category}`);
        continue;
      }

      // Create event date (next 60 days, spread out)
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + Math.floor(i * 4));
      eventDate.setHours(template.hours, 0, 0, 0);

      const timeString = `${template.hours.toString().padStart(2, '0')}:00`;

      const event = await prisma.event.create({
        data: {
          title: `${template.title} - ${company.name}`,
          description: descriptions[i % descriptions.length],
          date: eventDate,
          time: timeString,
          location: locations[i % locations.length],
          categoryId: categoryId,
          organizerId: user.id,
          imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&q=80&w=1200`
        }
      });

      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ Created ${i + 1}/15 events`);
      }
    }

    console.log(`  ✓ Created all 15 events for ${company.name}\n`);
  }

  console.log('✅ Company and event seeding completed!\n');
  console.log(`Total companies created: ${companies.length}`);
  console.log(`Total events created: ${companies.length * 15}`);
}

seedCompanies()
  .catch((e) => {
    console.error('❌ Error seeding companies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
