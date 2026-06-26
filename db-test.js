const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.financialAccount.findMany();
  console.log("Accounts:", accounts);
  
  const categories = await prisma.category.findMany();
  console.log("Categories:", categories);
}

main().finally(() => prisma.$disconnect());
