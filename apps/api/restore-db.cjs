const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 

async function main() {
    // Restore Energy callbackUrl to production
    await prisma.appModule.update({
        where: { id: "ENERGY" },
        data: { callbackUrl: "https://energy.sparta-alfamart.web.id/api/auth/sso/callback" }
    });
    
    console.log("Restored ENERGY callbackUrl to production in database.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
