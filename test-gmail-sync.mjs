import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  console.log("Setting up Prisma database adapter...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Prepare test user and database state
    console.log("Preparing test database state for test@example.com...");
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (user) {
      // Delete all existing transactions for the user first to avoid foreign key violations
      await prisma.transaction.deleteMany({
        where: { userId: user.id }
      });
      // Now safe to clear user categories to test auto-seeding
      await prisma.category.deleteMany({ where: { userId: user.id } });
    }

    // 2. Perform Login
    console.log("Navigating to signin page...");
    await page.goto('http://localhost:3000/auth/signin');
    
    console.log("Submitting login form...");
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'any');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    console.log("Login successful!");

    // Re-fetch user ID now that they signed in (and user is guaranteed to exist)
    user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    if (!user) throw new Error("Test user not found in database");

    // 3. Verify Auto-Seeding
    console.log("Verifying categories have been auto-seeded...");
    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    });
    const categoryNames = categories.map(c => c.name);
    console.log("Seeded categories found in DB:", categoryNames);
    
    const expected = ["Makan dan Minum", "Jajan", "Bensin", "Belanja", "Lainnya"];
    for (const catName of expected) {
      if (!categoryNames.includes(catName)) {
        throw new Error(`Category "${catName}" was not seeded!`);
      }
    }
    console.log("Category seeding verified successfully!");

    // 4. Set up mock account and draft transactions for UI flow testing
    console.log("Ensuring test account exists...");
    let account = await prisma.financialAccount.findFirst({
      where: { userId: user.id }
    });
    if (!account) {
      account = await prisma.financialAccount.create({
        data: {
          userId: user.id,
          name: 'Playwright Checking Account',
          type: 'checking',
          balance: 1000000
        }
      });
    }

    const testCategory = categories.find(c => c.name === 'Makan dan Minum');

    console.log("Seeding test draft transactions...");
    const draftConfirm = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        categoryId: testCategory?.id || null,
        amount: -25000,
        note: 'Playwright Test Draft',
        date: new Date(),
        type: 'EXPENSE',
        status: 'DRAFT'
      }
    });

    const draftDiscard = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        categoryId: testCategory?.id || null,
        amount: -10000,
        note: 'Playwright Test Discard',
        date: new Date(),
        type: 'EXPENSE',
        status: 'DRAFT'
      }
    });

    // 5. Test Confirm UI Flow
    console.log("Navigating to transactions page...");
    await page.goto('http://localhost:3000/transactions');
    await page.waitForLoadState('networkidle');

    console.log("Verifying draft transactions are listed with 'Pending Sync' labels...");
    const hasDraftLabel = await page.isVisible('text=Pending Sync');
    if (!hasDraftLabel) {
      throw new Error("Draft transactions 'Pending Sync' label is not visible!");
    }

    const draftConfirmVisible = await page.isVisible('text=Playwright Test Draft');
    if (!draftConfirmVisible) {
      throw new Error("Mock transaction 'Playwright Test Draft' is not visible!");
    }

    console.log("Confirming the draft transaction...");
    // Find the row containing 'Playwright Test Draft' and click its Confirm button
    const confirmForm = page.locator('tr', { hasText: 'Playwright Test Draft' }).locator('button:has-text("Confirm")');
    await confirmForm.click();

    // Wait for the Confirm button to be detached (indicating server action completed and UI re-rendered)
    await confirmForm.waitFor({ state: 'detached' });
    console.log("Draft confirmed in UI. Verifying DB status update...");

    const updatedTx = await prisma.transaction.findUnique({
      where: { id: draftConfirm.id }
    });
    if (updatedTx?.status !== 'CONFIRMED') {
      throw new Error(`Transaction status is ${updatedTx?.status}, expected CONFIRMED!`);
    }
    console.log("Transaction confirmed successfully in database!");

    // 6. Test Discard UI Flow
    console.log("Discarding the second draft transaction...");
    const discardButton = page.locator('tr', { hasText: 'Playwright Test Discard' }).locator('button:has-text("Discard")');
    await discardButton.click();

    // Wait for the Discard button / transaction row text to be detached
    await page.locator('text=Playwright Test Discard').waitFor({ state: 'detached' });
    console.log("Draft discarded in UI. Verifying DB deletion...");

    const deletedTx = await prisma.transaction.findUnique({
      where: { id: draftDiscard.id }
    });
    if (deletedTx !== null) {
      throw new Error("Transaction was not deleted from database!");
    }
    console.log("Transaction discarded successfully!");

    console.log("\n==========================================");
    console.log("🏆 ALL E2E GMAIL SYNC TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================\n");

  } catch (error) {
    console.error("❌ E2E TEST FAILED:", error);
    process.exitCode = 1;
  } finally {
    console.log("Cleaning up and closing connections...");
    await browser.close();
    await prisma.$disconnect();
    await pool.end();
  }
})();
