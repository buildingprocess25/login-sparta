const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'septian.saptaringga@sat.co.id' } })
  .then(u => console.log('Connected! Email:', u?.email))
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
