const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            accesses: {
                include: {
                    module: true
                }
            }
        }
    });
    
    // 1. User with 3 modules
    const user3 = users.find(u => u.accesses.length >= 3);
    console.log('--- 3 MODULES ---');
    console.log(user3 ? {email: user3.email, modules: user3.accesses.map(r => r.module.name)} : 'None found');
    
    // 2. User with 2 modules
    const user2 = users.find(u => u.accesses.length === 2);
    console.log('\n--- 2 MODULES ---');
    console.log(user2 ? {email: user2.email, modules: user2.accesses.map(r => r.module.name)} : 'None found');
    
    // 3. User with 1 module
    const user1 = users.find(u => u.accesses.length === 1);
    console.log('\n--- 1 MODULE ---');
    console.log(user1 ? {email: user1.email, modules: user1.accesses.map(r => r.module.name)} : 'None found');
}

main().finally(() => prisma.$disconnect());
