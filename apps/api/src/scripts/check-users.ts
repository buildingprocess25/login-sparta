import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ datasourceUrl: "postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/sparta?sslmode=disable" });
async function main() {
  const user1 = await prisma.user.findUnique({ where: { email: "wardannugrahaahmad@gmail.com" } });
  console.log("wardannugrahaahmad:", user1?.validBranchNames);
  
  const user2 = await prisma.user.findUnique({ where: { email: "bernandus.d.siahaan@sat.co.id" } });
  console.log("bernandus:", user2?.validBranchNames);
}
main().finally(() => prisma.$disconnect());
