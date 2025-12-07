
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: npx ts-node server/scripts/make_admin.ts <email>');
        process.exit(1);
    }

    console.log(`Attempting to promote user: ${email}...`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });
        console.log(`Successfully updated user ${updatedUser.email} to admin role.`);
    } catch (error) {
        console.error('Error updating user:', error);
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
