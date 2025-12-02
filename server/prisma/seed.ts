import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({});

const eventsData = [
  {
    title: 'Community Garden Workshop',
    date: new Date('2025-12-07'),
    time: '10:00 - 13:00',
    location: 'Enschede Community Garden',
    attendees: 24,
    imageUrl: 'https://images.unsplash.com/photo-1513906029980-32d13afe6d8c?auto=format&fit=crop&w=1080&q=80',
    description: 'Learn sustainable gardening techniques and connect with fellow gardeners in our community.',
    category: 'Gardening'
  },
  {
    title: 'Healthy Cooking Class',
    date: new Date('2025-12-10'),
    time: '18:00 - 20:30',
    location: 'De Kookplaats, Hengelo',
    attendees: 18,
    imageUrl: 'https://images.unsplash.com/photo-1686657429079-95d763456dbd?auto=format&fit=crop&w=1080&q=80',
    description: 'Discover delicious and nutritious recipes using local, seasonal ingredients.',
    category: 'Food & Nutrition'
  },
  {
    title: 'Nature Walk & Meditation',
    date: new Date('2025-12-14'),
    time: '09:00 - 11:00',
    location: 'Lonnekerberg Nature Reserve',
    attendees: 32,
    imageUrl: 'https://images.unsplash.com/photo-1734596438089-ef300bc02fb0?auto=format&fit=crop&w=1080&q=80',
    description: 'Join us for a peaceful morning walk in nature followed by a guided meditation session.',
    category: 'Wellbeing'
  },
  {
    title: 'Winter Farmers Market',
    date: new Date('2025-12-17'),
    time: '10:00 - 14:00',
    location: 'Enschede Central Square',
    attendees: 120,
    imageUrl: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=1080&q=80',
    description: 'Shop local produce, handmade goods, and meet the farmers and artisans of Twente.',
    category: 'Food & Nutrition'
  },
  {
    title: 'Community Potluck Dinner',
    date: new Date('2025-12-20'),
    time: '18:00 - 21:00',
    location: 'Community Center Hengelo',
    attendees: 45,
    imageUrl: 'https://images.unsplash.com/photo-1625246433906-6cfa33544b31?auto=format&fit=crop&w=1080&q=80',
    description: 'Bring your favorite dish and share a meal with neighbors. A great way to connect and celebrate the season.',
    category: 'Social'
  },
  {
    title: 'Sustainable Living Workshop',
    date: new Date('2025-12-22'),
    time: '14:00 - 17:00',
    location: 'EcoHub Enschede',
    attendees: 28,
    imageUrl: 'https://images.unsplash.com/photo-1661328992560-55256f06bdad?auto=format&fit=crop&w=1080&q=80',
    description: 'Learn practical tips for reducing waste, conserving energy, and living more sustainably.',
    category: 'Sustainability'
  }
];

const discussionsData = [
  {
    title: 'Best Local Markets in Enschede?',
    category: 'Food & Nutrition',
    preview:
      "I'm new to the area and looking for recommendations on the best local markets for fresh produce. Any suggestions?"
  },
  {
    title: 'Starting a Community Garden - Tips Needed',
    category: 'Local Initiatives',
    preview: 'Planning to start a community garden. Would love to hear from anyone with experience!'
  },
  {
    title: 'Weekly Walking Group - Join Us!',
    category: 'Health & Wellbeing',
    preview: 'Walking group meets every Saturday morning at 9 AM. All fitness levels welcome!'
  },
  {
    title: 'Healthy Meal Prep Ideas for Busy Weeks',
    category: 'Food & Nutrition',
    preview: 'Share your favorite meal prep recipes that are healthy and delicious.'
  },
  {
    title: 'Yoga in the Park',
    category: 'Health & Wellbeing',
    preview: 'Is anyone interested in joining a free yoga session this Sunday at the park?'
  },
  {
    title: 'Recycling Tips',
    category: 'Sustainability',
    preview: 'I found a great guide on how to recycle effectively. Sharing it here for everyone.'
  },
  {
    title: 'Book Club: December Pick',
    category: 'Social',
    preview: 'We are reading "The Blue Zones" this month. Join the discussion!'
  },
  {
    title: 'Volunteer Opportunities',
    category: 'Local Initiatives',
    preview: 'Looking for volunteers to help with the upcoming winter market. Sign up if interested.'
  }
];

const initiativesData = [
  {
    name: 'Enschede Community Garden',
    type: 'garden',
    location: 'Hengelosestraat 32, Enschede',
    description: 'A thriving community garden where members grow vegetables, herbs, and flowers together.',
    coordinateX: 30,
    coordinateY: 40,
    contact: 'garden@bluezonetwente.nl',
    website: 'https://enschedegarden.nl'
  },
  {
    name: 'Weekly Farmers Market',
    type: 'market',
    location: 'Oldenzaal Town Square',
    description: 'Local farmers and artisans gather to sell fresh produce, baked goods, and handmade items.',
    coordinateX: 70,
    coordinateY: 25,
    contact: 'market@bluezonetwente.nl'
  },
  {
    name: 'Hengelo Walking Group',
    type: 'group',
    location: 'Starts at Central Park, Hengelo',
    description: 'Social walk every Wednesday evening. All fitness levels welcome.',
    coordinateX: 50,
    coordinateY: 60,
    contact: 'walking@bluezonetwente.nl'
  },
  {
    name: 'De Groene Winkel',
    type: 'market',
    location: 'Langestraat 45, Enschede',
    description: 'Organic food store specializing in local, sustainable products.',
    coordinateX: 35,
    coordinateY: 50,
    website: 'https://degroenewinkel.nl'
  },
  {
    name: 'Lonnekerberg Nature Reserve',
    type: 'event',
    location: 'Lonnekerberg, near Enschede',
    description: 'Nature area perfect for walking, meditation, and connecting with nature.',
    coordinateX: 45,
    coordinateY: 30
  },
  {
    name: 'Community Kitchen Oldenzaal',
    type: 'event',
    location: 'Ganzenmarkt 8, Oldenzaal',
    description: 'Monthly cooking classes and community dinners featuring healthy, seasonal recipes.',
    coordinateX: 75,
    coordinateY: 45,
    contact: 'kitchen@bluezonetwente.nl'
  },
  {
    name: 'Bike Repair Collective',
    type: 'group',
    location: 'Haaksbergerstraat 220, Enschede',
    description: 'Learn to repair your own bike or help others. Tools and expertise shared freely every Sunday.',
    coordinateX: 25,
    coordinateY: 70
  }
];

const newslettersData = [
  {
    title: 'December 2025 - Winter Wellness',
    description: 'Seasonal recipes, upcoming winter events, and tips for staying active during the colder months.',
    topics: ['Healthy Eating', 'Winter Activities', 'Community Events'],
    publishedAt: new Date('2025-12-01')
  },
  {
    title: 'November 2025 - Harvest Season',
    description: 'Celebrating local harvests, preserving techniques, and stories from community gardens.',
    topics: ['Food Preservation', 'Local Produce', 'Garden Updates'],
    publishedAt: new Date('2025-11-01')
  },
  {
    title: 'October 2025 - Community Connections',
    description: 'Spotlight on new initiatives, member stories, and the impact of our walking groups.',
    topics: ['Member Stories', 'New Initiatives', 'Walking Groups'],
    publishedAt: new Date('2025-10-01')
  },
  {
    title: 'September 2025 - Back to Basics',
    description: 'Simple healthy habits, meal planning tips, and upcoming autumn workshops.',
    topics: ['Healthy Habits', 'Meal Planning', 'Workshops'],
    publishedAt: new Date('2025-09-01')
  }
];

async function main() {
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.savedInitiative.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password1', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@bluezone.com',
        name: 'Admin User',
        password,
        role: 'admin',
        interests: ['gardening', 'health'],
        newsletter: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'member@bluezone.com',
        name: 'Community Member',
        password,
        interests: ['walking', 'nutrition'],
        newsletter: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'moderator@bluezone.com',
        name: 'Forum Moderator',
        password,
        role: 'moderator',
        interests: ['cycling', 'sustainability']
      }
    })
  ]);

  const [adminUser, memberUser, moderatorUser] = users;

  const events = await Promise.all(
    eventsData.map((event, idx) =>
      prisma.event.create({
        data: {
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          imageUrl: event.imageUrl,
          maxAttendees: event.attendees,
          organizerId: adminUser.id
        }
      })
    )
  );

  await prisma.eventRegistration.create({ data: { userId: memberUser.id, eventId: events[0].id, status: 'registered' } });
  await prisma.eventRegistration.create({ data: { userId: moderatorUser.id, eventId: events[1].id, status: 'interested' } });

  const discussions = await Promise.all(
    discussionsData.map((discussion, index) =>
      prisma.discussion.create({
        data: {
          title: discussion.title,
          content: discussion.preview,
          category: discussion.category,
          authorId: index % 2 === 0 ? memberUser.id : moderatorUser.id
        }
      })
    )
  );

  for (const discussion of discussions) {
    await prisma.reply.create({
      data: {
        content: faker.lorem.sentences(2),
        authorId: adminUser.id,
        discussionId: discussion.id
      }
    });
  }

  const initiatives = await Promise.all(
    initiativesData.map((init) =>
      prisma.initiative.create({
        data: { ...init }
      })
    )
  );

  await prisma.savedInitiative.create({ data: { initiativeId: initiatives[0].id, userId: memberUser.id } });

  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Community Garden Members',
        category: 'Gardening',
        description: 'Connect with local gardeners to share tips and plan meetups.',
        members: { create: [{ userId: memberUser.id, role: 'member' }, { userId: adminUser.id, role: 'admin' }] }
      }
    }),
    prisma.group.create({
      data: {
        name: 'Walking Group Hengelo',
        category: 'Health',
        description: 'Weekly walking sessions around Hengelo.',
        members: { create: [{ userId: memberUser.id, role: 'member' }, { userId: moderatorUser.id, role: 'moderator' }] }
      }
    }),
    prisma.group.create({
      data: {
        name: 'Healthy Cooking Enthusiasts',
        category: 'Food & Nutrition',
        description: 'Share recipes and host cooking nights.',
        members: { create: [{ userId: moderatorUser.id, role: 'admin' }] }
      }
    })
  ]);

  await prisma.newsletter.createMany({
    data: newslettersData
  });
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: adminUser.email, subscribed: true, userId: adminUser.id },
      { email: memberUser.email, subscribed: true, userId: memberUser.id }
    ]
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
