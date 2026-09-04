const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 

async function main() {
    // Update Energy callbackUrl to current port 3000
    await prisma.appModule.update({
        where: { id: "ENERGY" },
        data: { callbackUrl: "http://localhost:3000/api/auth/sso/callback" }
    });
    
    const updated = await prisma.appModule.findUnique({ where: { id: "ENERGY" } });
    console.log("✅ Updated Energy callbackUrl:", updated.callbackUrl);
}

main().catch(console.error).finally(() => prisma.$disconnect());
