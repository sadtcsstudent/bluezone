
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding newsletters...');

    // Clear existing
    await prisma.newsletter.deleteMany({});

    // Add new ones
    await prisma.newsletter.create({
        data: {
            title: 'January 2025 Newsletter',
            description: 'Kicking off the new year with health resolutions and community events.',
            topics: ['New Year', 'Health', 'Community'],
            publishedAt: new Date('2025-01-15'),
            fileUrl: '/uploads/news-jan.pdf'
        }
    });

    await prisma.newsletter.create({
        data: {
            title: 'December 2024 Newsletter',
            description: 'Holiday celebrations and winter wellness tips.',
            topics: ['Holidays', 'Winter', 'Events'],
            publishedAt: new Date('2024-12-15'),
            fileUrl: '/uploads/news-jan.pdf' // Reusing dummy file
        }
    });

    console.log('Newsletters seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
