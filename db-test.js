require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const credentials = await prisma.gmailCredential.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        }
      }
    }
  });
  console.log("Credentials:", JSON.stringify(credentials, null, 2));

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: credentials[0]?.userId }
  });
  console.log("Financial Accounts:", JSON.stringify(accounts, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
