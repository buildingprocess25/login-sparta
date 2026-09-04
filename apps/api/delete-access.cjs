const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient(); 
prisma.userModuleAccess.delete({ where: { id: "3616edf6-7543-4c5f-94f5-cacd121aae1d" } })
.then(() => console.log("Deleted ENERGY access"))
.catch(console.error)
.finally(() => prisma.$disconnect());
