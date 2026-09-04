const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['septian.saptaringga@sat.co.id', 'abdillah.pramadhani@sat.co.id', 'oksandi91@gmail.com', 'obakontraktor@gmail.com', 'kpm.an@yahoo.co.id', 'adimas131320@gmail.com', 'agus.erwanto@sat.co.id'];
    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        include: { branch: true }
    });
    console.log(users.map(u => ({email: u.email, branchName: u.branch.name})));
}

main().finally(() => prisma.$disconnect());
