
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client models...');

    if ('replyLike' in prisma) {
        console.log('✅ prisma.replyLike is defined');
        // @ts-ignore
        const count = await prisma.replyLike.count();
        console.log(`Count of ReplyLike: ${count}`);
    } else {
        console.error('❌ prisma.replyLike is UNDEFINED');
        console.log('Available keys on prisma:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
