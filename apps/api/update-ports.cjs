const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 

async function main() {
    // Show current ports
    const modules = await prisma.appModule.findMany({ 
        orderBy: { sortOrder: "asc" },
        select: { id: true, callbackUrl: true, name: true }
    });
    console.log("Current module callbackUrls:");
    modules.forEach(m => console.log(` ${m.id}: ${m.callbackUrl}`));
    
    // sparta-fe (Building) is now on port 3001
    await prisma.appModule.update({
        where: { id: "BUILDING" },
        data: { callbackUrl: "http://localhost:3001/api/auth/sso/resolve" }
    });
    
    // Energy still on 3000 (already updated)
    // Maintenance - check which port it's on
    console.log("\n✅ Updated BUILDING callbackUrl to port 3001");
    
    const updated = await prisma.appModule.findMany({ 
        orderBy: { sortOrder: "asc" },
        select: { id: true, callbackUrl: true }
    });
    console.log("\nUpdated module callbackUrls:");
    updated.forEach(m => console.log(` ${m.id}: ${m.callbackUrl}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
