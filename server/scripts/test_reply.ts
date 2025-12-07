
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) throw new Error('No user found');
        console.log('User found:', user.id);

        const discussion = await prisma.discussion.findFirst();
        if (!discussion) throw new Error('No discussion found');
        console.log('Discussion found:', discussion.id);

        const content = 'Test reply content';
        console.log('Attempting to create reply...');

        const reply = await prisma.reply.create({
            data: {
                content,
                authorId: user.id,
                discussionId: discussion.id
            },
            include: { author: true }
        });

        console.log('Reply created successfully:', reply.id);
    } catch (error: any) {
        console.error('Error creating reply:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
