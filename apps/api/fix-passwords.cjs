const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['septian.saptaringga@sat.co.id', 'abdillah.pramadhani@sat.co.id', 'oksandi91@gmail.com', 'obakontraktor@gmail.com', 'kpm.an@yahoo.co.id', 'adimas131320@gmail.com', 'agus.erwanto@sat.co.id'];
    
    const result = await prisma.user.updateMany({
        where: { email: { in: emails } },
        data: {
            passwordState: 'BRANCH_DEFAULT',
            passwordHash: null
        }
    });
    
    console.log(`Updated ${result.count} users to BRANCH_DEFAULT`);
}

main().finally(() => prisma.$disconnect());
