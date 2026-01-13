import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seeding...');

  // Clear existing data (in correct order to handle foreign keys)
  console.log('Clearing existing data...');
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.replyLike.deleteMany();
  await prisma.discussionLike.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.savedInitiative.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bluezone.nl',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      location: 'Enschede, Netherlands',
      bio: 'Platform administrator',
      interests: ['Sustainability', 'Community', 'Environment'],
      newsletter: true
    }
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emma.vries@example.nl',
        password: hashedPassword,
        name: 'Emma de Vries',
        location: 'Hengelo, Netherlands',
        bio: 'Passionate about urban gardening and sustainable living',
        interests: ['Gardening', 'Sustainability', 'Local Food'],
        newsletter: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'lucas.janssen@example.nl',
        password: hashedPassword,
        name: 'Lucas Janssen',
        location: 'Enschede, Netherlands',
        bio: 'Environmental activist and community organizer',
        interests: ['Climate Action', 'Community Building', 'Activism'],
        newsletter: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'sophie.bakker@example.nl',
        password: hashedPassword,
        name: 'Sophie Bakker',
        location: 'Almelo, Netherlands',
        bio: 'Local food enthusiast and farmers market volunteer',
        interests: ['Local Food', 'Cooking', 'Sustainability'],
        newsletter: false
      }
    }),
    prisma.user.create({
      data: {
        email: 'daan.mulder@example.nl',
        password: hashedPassword,
        name: 'Daan Mulder',
        location: 'Deventer, Netherlands',
        bio: 'Renewable energy advocate and solar panel installer',
        interests: ['Renewable Energy', 'Technology', 'DIY'],
        newsletter: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'lotte.visser@example.nl',
        password: hashedPassword,
        name: 'Lotte Visser',
        location: 'Zwolle, Netherlands',
        bio: 'Zero waste lifestyle blogger and workshop facilitator',
        interests: ['Zero Waste', 'Minimalism', 'Education'],
        newsletter: true
      }
    })
  ]);

  // 2. Create Categories
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Sustainability', icon: 'Leaf', color: '#10B981' } }),
    prisma.category.create({ data: { name: 'Community', icon: 'Users', color: '#3B82F6' } }),
    prisma.category.create({ data: { name: 'Education', icon: 'BookOpen', color: '#8B5CF6' } }),
    prisma.category.create({ data: { name: 'Food', icon: 'Apple', color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Environment', icon: 'TreePine', color: '#059669' } }),
    prisma.category.create({ data: { name: 'Energy', icon: 'Zap', color: '#EAB308' } }),
  ]);

  // 3. Create Events
  console.log('Creating events...');
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Community Garden Workshop',
        description: 'Learn how to start your own community garden! We will cover soil preparation, composting, and sustainable gardening practices.',
        date: new Date('2026-02-15T10:00:00'),
        time: '10:00 - 13:00',
        location: 'Volkspark Enschede',
        categoryId: categories[0].id,
        imageUrl: '/uploads/event-garden.jpg',
        maxAttendees: 30,
        organizerId: admin.id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Zero Waste Living Workshop',
        description: 'Discover practical tips to reduce waste in your daily life. Bring your own containers for samples!',
        date: new Date('2026-02-20T14:00:00'),
        time: '14:00 - 16:00',
        location: 'BlueZone Community Center, Hengelo',
        categoryId: categories[0].id,
        imageUrl: '/uploads/event-zerowaste.jpg',
        maxAttendees: 25,
        organizerId: users[4].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Local Food Market',
        description: 'Monthly farmers market featuring local producers, organic vegetables, and sustainable products.',
        date: new Date('2026-02-08T09:00:00'),
        time: '09:00 - 14:00',
        location: 'Marktplein, Enschede',
        categoryId: categories[3].id,
        imageUrl: '/uploads/event-market.jpg',
        maxAttendees: null,
        organizerId: users[2].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Solar Energy Information Session',
        description: 'Interested in solar panels? Join us to learn about costs, savings, and installation process.',
        date: new Date('2026-02-25T19:00:00'),
        time: '19:00 - 21:00',
        location: 'TechHub Enschede',
        categoryId: categories[5].id,
        imageUrl: '/uploads/event-solar.jpg',
        maxAttendees: 40,
        organizerId: users[3].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Climate Action Town Hall',
        description: 'Join local activists and city officials to discuss climate action plans for Overijssel.',
        date: new Date('2026-03-05T18:30:00'),
        time: '18:30 - 21:00',
        location: 'Stadshuis Enschede',
        categoryId: categories[4].id,
        imageUrl: '/uploads/event-climate.jpg',
        maxAttendees: 100,
        organizerId: users[1].id
      }
    }),
    prisma.event.create({
      data: {
        title: 'Community Bike Repair Workshop',
        description: 'Learn basic bike maintenance and repair skills. Bring your bike if it needs fixing!',
        date: new Date('2026-02-18T15:00:00'),
        time: '15:00 - 18:00',
        location: 'Bike Co-op, Hengelo',
        categoryId: categories[1].id,
        imageUrl: '/uploads/event-bike.jpg',
        maxAttendees: 20,
        organizerId: admin.id
      }
    })
  ]);

  // 4. Create Event Registrations
  console.log('Creating event registrations...');
  await Promise.all([
    prisma.eventRegistration.create({ data: { userId: users[0].id, eventId: events[0].id } }),
    prisma.eventRegistration.create({ data: { userId: users[1].id, eventId: events[0].id } }),
    prisma.eventRegistration.create({ data: { userId: users[2].id, eventId: events[2].id } }),
    prisma.eventRegistration.create({ data: { userId: users[3].id, eventId: events[3].id } }),
    prisma.eventRegistration.create({ data: { userId: users[4].id, eventId: events[1].id } }),
    prisma.eventRegistration.create({ data: { userId: users[0].id, eventId: events[4].id } }),
  ]);

  // 5. Create Initiatives
  console.log('Creating initiatives...');
  const initiatives = await Promise.all([
    prisma.initiative.create({
      data: {
        name: 'Volkspark Community Garden',
        type: 'garden',
        location: 'Volkspark, Enschede',
        description: 'A thriving community garden where neighbors grow organic vegetables together. New members welcome!',
        latitude: 52.2215,
        longitude: 6.8957,
        contact: 'emma.vries@example.nl',
        website: 'volkspark-garden.nl',
        createdById: users[0].id
      }
    }),
    prisma.initiative.create({
      data: {
        name: 'Hengelo Organic Market',
        type: 'market',
        location: 'Marktplein, Hengelo',
        description: 'Weekly market featuring local organic produce, handmade goods, and sustainable products.',
        latitude: 52.2656,
        longitude: 6.7939,
        contact: 'market@hengelo-organic.nl',
        website: 'hengelo-organic-market.nl',
        createdById: users[2].id
      }
    }),
    prisma.initiative.create({
      data: {
        name: 'BlueZone Sustainability Hub',
        type: 'group',
        location: 'Haaksbergerstraat 123, Enschede',
        description: 'Community center offering workshops, events, and resources for sustainable living.',
        latitude: 52.2183,
        longitude: 6.8965,
        contact: 'info@bluezone-hub.nl',
        website: 'bluezone-hub.nl',
        createdById: admin.id
      }
    }),
    prisma.initiative.create({
      data: {
        name: 'Solar Cooperative Overijssel',
        type: 'group',
        location: 'Deventer',
        description: 'Cooperative helping residents install solar panels at reduced costs through group purchasing.',
        latitude: 52.2551,
        longitude: 6.1636,
        contact: 'daan.mulder@example.nl',
        createdById: users[3].id
      }
    }),
    prisma.initiative.create({
      data: {
        name: 'Zero Waste Store Zwolle',
        type: 'market',
        location: 'Diezerstraat 45, Zwolle',
        description: 'Package-free grocery store offering bulk foods, eco-friendly products, and refill stations.',
        latitude: 52.5125,
        longitude: 6.0944,
        contact: 'lotte.visser@example.nl',
        website: 'zerowaste-zwolle.nl',
        createdById: users[4].id
      }
    })
  ]);

  // 6. Create Groups
  console.log('Creating groups...');
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Enschede Climate Action',
        category: 'Environment',
        description: 'Local group organizing climate strikes, awareness campaigns, and community projects.',
        avatar: null
      }
    }),
    prisma.group.create({
      data: {
        name: 'Urban Gardeners Overijssel',
        category: 'Food',
        description: 'Connect with fellow gardeners, share tips, and organize seed swaps.',
        avatar: null
      }
    }),
    prisma.group.create({
      data: {
        name: 'Circular Economy Network',
        category: 'Sustainability',
        description: 'Professionals and enthusiasts promoting circular economy principles in the region.',
        avatar: null
      }
    })
  ]);

  // Add members to groups
  await Promise.all([
    prisma.groupMember.create({ data: { userId: users[1].id, groupId: groups[0].id, role: 'admin' } }),
    prisma.groupMember.create({ data: { userId: users[0].id, groupId: groups[0].id, role: 'member' } }),
    prisma.groupMember.create({ data: { userId: users[0].id, groupId: groups[1].id, role: 'admin' } }),
    prisma.groupMember.create({ data: { userId: users[2].id, groupId: groups[1].id, role: 'member' } }),
    prisma.groupMember.create({ data: { userId: users[4].id, groupId: groups[2].id, role: 'admin' } }),
  ]);

  // 7. Create Forum Discussions
  console.log('Creating forum discussions...');
  const discussions = await Promise.all([
    prisma.discussion.create({
      data: {
        title: 'Tips for Starting a Balcony Garden?',
        content: 'Hi everyone! I live in an apartment and want to start growing herbs and vegetables on my balcony. Any tips for beginners? What containers work best?',
        category: 'Gardening',
        authorId: users[0].id,
        views: 45
      }
    }),
    prisma.discussion.create({
      data: {
        title: 'Best Places to Buy Bulk Foods in Overijssel?',
        content: 'Looking for stores where I can buy rice, pasta, nuts, etc. without plastic packaging. Any recommendations in the Enschede/Hengelo area?',
        category: 'Zero Waste',
        authorId: users[4].id,
        views: 32
      }
    }),
    prisma.discussion.create({
      data: {
        title: 'Experience with Heat Pumps?',
        content: 'Considering replacing my gas boiler with a heat pump. Does anyone have experience with this? What are the costs and savings?',
        category: 'Energy',
        authorId: users[3].id,
        views: 67
      }
    }),
    prisma.discussion.create({
      data: {
        title: 'Organizing Community Cleanup Event',
        content: 'Planning a neighborhood cleanup for next month. Anyone interested in joining? We can make it fun with music and snacks afterwards!',
        category: 'Community',
        authorId: users[1].id,
        views: 28
      }
    })
  ]);

  // 8. Create Replies
  console.log('Creating forum replies...');
  await Promise.all([
    prisma.reply.create({
      data: {
        content: 'Welcome! I\'ve had great success with tomatoes and basil on my balcony. Make sure your containers have drainage holes!',
        authorId: users[2].id,
        discussionId: discussions[0].id
      }
    }),
    prisma.reply.create({
      data: {
        content: 'The Zero Waste Store in Zwolle is amazing! They have a huge selection and the staff is super helpful.',
        authorId: users[0].id,
        discussionId: discussions[1].id
      }
    }),
    prisma.reply.create({
      data: {
        content: 'I installed a heat pump last year. Initial cost was high but my energy bills dropped by 40%! Happy to answer specific questions.',
        authorId: admin.id,
        discussionId: discussions[2].id
      }
    }),
    prisma.reply.create({
      data: {
        content: 'I\'m in! We should also bring reusable bags and gloves. Maybe contact the municipality for supplies?',
        authorId: users[4].id,
        discussionId: discussions[3].id
      }
    })
  ]);

  // 9. Create Newsletter Subscribers
  console.log('Creating newsletter subscribers...');
  await Promise.all([
    prisma.newsletterSubscriber.create({ data: { email: admin.email, userId: admin.id } }),
    prisma.newsletterSubscriber.create({ data: { email: users[0].email, userId: users[0].id } }),
    prisma.newsletterSubscriber.create({ data: { email: users[1].email, userId: users[1].id } }),
    prisma.newsletterSubscriber.create({ data: { email: users[3].email, userId: users[3].id } }),
    prisma.newsletterSubscriber.create({ data: { email: users[4].email, userId: users[4].id } }),
    prisma.newsletterSubscriber.create({ data: { email: 'subscriber@example.nl' } }),
  ]);

  // 10. Create Newsletters
  console.log('Creating newsletters...');
  await Promise.all([
    prisma.newsletter.create({
      data: {
        title: 'January 2026 - Community Highlights',
        description: 'Upcoming events, new initiatives, and success stories from our community.',
        topics: ['Events', 'Community', 'Sustainability'],
        publishedAt: new Date('2026-01-15T09:00:00')
      }
    }),
    prisma.newsletter.create({
      data: {
        title: 'December 2025 - Year in Review',
        description: 'Looking back at 2025: achievements, growth, and plans for 2026.',
        topics: ['Year Review', 'Community', 'Growth'],
        publishedAt: new Date('2025-12-20T09:00:00')
      }
    })
  ]);

  // 11. Create Polls
  console.log('Creating community polls...');
  const poll1 = await prisma.poll.create({
    data: {
      question: 'What type of workshop would you like to see next?',
      active: true,
      allowMultiple: false,
      allowChangeVote: true,
      createdById: admin.id
    }
  });

  const poll1Options = await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll1.id, text: 'Composting Basics' } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: 'DIY Solar Projects' } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: 'Sustainable Fashion' } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: 'Vegan Cooking' } })
  ]);

  // Add some votes
  await Promise.all([
    prisma.pollVote.create({ data: { pollId: poll1.id, optionId: poll1Options[0].id, userId: users[0].id } }),
    prisma.pollVote.create({ data: { pollId: poll1.id, optionId: poll1Options[1].id, userId: users[3].id } }),
    prisma.pollVote.create({ data: { pollId: poll1.id, optionId: poll1Options[0].id, userId: users[2].id } }),
    prisma.pollVote.create({ data: { pollId: poll1.id, optionId: poll1Options[3].id, userId: users[4].id } }),
  ]);

  const poll2 = await prisma.poll.create({
    data: {
      question: 'Which topics interest you most?',
      active: true,
      allowMultiple: true,
      allowChangeVote: true,
      createdById: admin.id
    }
  });

  const poll2Options = await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll2.id, text: 'Climate Action' } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: 'Local Food Systems' } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: 'Renewable Energy' } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: 'Waste Reduction' } })
  ]);

  await Promise.all([
    prisma.pollVote.create({ data: { pollId: poll2.id, optionId: poll2Options[0].id, userId: users[1].id } }),
    prisma.pollVote.create({ data: { pollId: poll2.id, optionId: poll2Options[1].id, userId: users[1].id } }),
    prisma.pollVote.create({ data: { pollId: poll2.id, optionId: poll2Options[3].id, userId: users[4].id } }),
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nCreated:');
  console.log(`  - ${users.length + 1} users (including admin)`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${events.length} events`);
  console.log(`  - ${initiatives.length} initiatives`);
  console.log(`  - ${groups.length} groups`);
  console.log(`  - ${discussions.length} forum discussions`);
  console.log(`  - 2 newsletters`);
  console.log(`  - 2 polls with options and votes`);
  console.log('\nTest Credentials:');
  console.log('  Admin: admin@bluezone.nl / password123');
  console.log('  User: emma.vries@example.nl / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
