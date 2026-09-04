const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 

async function main() {
    const user = await prisma.user.findUnique({ where: { email: "agus.erwanto@sat.co.id" } });
    if (!user) { console.error("User not found!"); return; }

    // 1. Restore ENERGY access
    const existing = await prisma.userModuleAccess.findFirst({
        where: { userId: user.id, moduleId: "ENERGY" }
    });
    if (!existing) {
        await prisma.userModuleAccess.create({
            data: {
                userId: user.id,
                moduleId: "ENERGY",
                role: "USER",
                isActive: true,
            }
        });
        console.log("✅ ENERGY access restored for", user.email);
    } else {
        console.log("ℹ️ ENERGY access already exists");
    }

    // 2. Fix callbackUrl for ENERGY module - update to correct port
    const module = await prisma.appModule.findUnique({ where: { id: "ENERGY" } });
    console.log("Current Energy callbackUrl:", module?.callbackUrl);

    await prisma.appModule.update({
        where: { id: "ENERGY" },
        data: { callbackUrl: "http://localhost:3002/api/auth/sso/callback" }
    });
    console.log("✅ ENERGY callbackUrl confirmed as: http://localhost:3002/api/auth/sso/callback");

    // Show final state
    const updated = await prisma.user.findUnique({
        where: { email: "agus.erwanto@sat.co.id" },
        include: { accesses: { select: { moduleId: true, role: true, isActive: true } } }
    });
    console.log("Final accesses:", JSON.stringify(updated?.accesses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
