const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.appModule.findMany()
  .then(modules => console.log(modules.map(m => ({id: m.id, callback: m.callbackUrl}))))
  .finally(() => prisma.$disconnect());
