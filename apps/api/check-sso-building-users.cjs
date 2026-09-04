const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['obakontraktor@gmail.com', 'kpm.an@yahoo.co.id', 'adimas131320@gmail.com', 'agus.erwanto@sat.co.id'];
    const users = await prisma.user.findMany({
        where: { email: { in: emails } }
    });
    console.log(users.map(u => u.email));
}

main().finally(() => prisma.$disconnect());
