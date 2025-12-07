
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting verification of ReplyLike...');

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found. Create a user first.');
        return;
    }
    console.log('User found:', user.email);

    // 2. Get or create a discussion
    let discussion = await prisma.discussion.findFirst({
        include: { replies: true }
    });

    if (!discussion) {
        console.log('No discussion found. Creating one...');
        discussion = await prisma.discussion.create({
            data: {
                title: 'Test Discussion for Reply Like',
                content: 'This is a test discussion.',
                category: 'General',
                authorId: user.id
            },
            include: { replies: true }
        });
    }
    console.log('Discussion found:', discussion.id);

    // 3. Get or create a reply
    let reply = await prisma.reply.findFirst({
        where: { discussionId: discussion.id }
    });

    if (!reply) {
        console.log('No reply found. Creating one...');
        reply = await prisma.reply.create({
            data: {
                content: 'This is a test reply.',
                authorId: user.id,
                discussionId: discussion.id
            }
        });
    }
    console.log('Reply found:', reply.id);

    // 4. Like the reply directly via Prisma
    console.log('Attempting to create ReplyLike...');
    const like = await prisma.replyLike.create({
        data: {
            userId: user.id,
            replyId: reply.id
        }
    });
    console.log('ReplyLike created:', like.id);

    // 5. Verify it exists
    const count = await prisma.replyLike.count({
        where: { replyId: reply.id }
    });
    console.log('Reply like count:', count);

    // 6. Clean up
    console.log('Cleaning up...');
    await prisma.replyLike.delete({
        where: { id: like.id }
    });
    console.log('Cleaned up.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
