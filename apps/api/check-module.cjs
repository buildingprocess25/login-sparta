const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 
prisma.appModule.findUnique({ where: { id: "ENERGY" } })
.then(console.log)
.catch(console.error)
.finally(() => prisma.$disconnect());
