const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'septian.saptaringga@sat.co.id' }
    });
    console.log({
        email: user.email,
        passwordState: user.passwordState,
        passwordHash: user.passwordHash
    });
}

main().finally(() => prisma.$disconnect());
