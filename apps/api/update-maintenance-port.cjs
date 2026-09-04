const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 

async function main() {
    await prisma.appModule.update({
        where: { id: "MAINTENANCE" },
        data: { callbackUrl: "http://localhost:3002/auth/sso/callback" }
    });
    
    const modules = await prisma.appModule.findMany({ orderBy: { sortOrder: "asc" } });
    console.log("Final port mapping:");
    modules.forEach(m => console.log(` ${m.id}: ${m.callbackUrl}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
