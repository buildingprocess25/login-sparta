const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration to reset password states to BRANCH_DEFAULT...');
    
    // Check how many users we are updating
    const usersCount = await prisma.user.count();
    console.log(`Found ${usersCount} users in the SSO database.`);
    
    // Update all users to have BRANCH_DEFAULT
    // We set passwordHash to null since it's going to use the branch name anyway
    const result = await prisma.user.updateMany({
        where: {}, // All users
        data: {
            passwordState: 'BRANCH_DEFAULT',
            passwordHash: null 
        }
    });

    console.log(`Successfully updated ${result.count} users to BRANCH_DEFAULT password state.`);
    console.log('All users can now login with their branch name and will be forced to change their password on first login.');
}

main()
    .catch((e) => {
        console.error('Error during migration:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
