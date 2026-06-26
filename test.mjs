import { chromium } from 'playwright';

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to signin...");
    await page.goto('http://localhost:3000/auth/signin');
    
    console.log("Filling out dev credentials...");
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'any');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    console.log("Successfully logged in!");
    
    console.log("Navigating to accounts...");
    await page.goto('http://localhost:3000/accounts');
    
    console.log("Creating an account...");
    await page.fill('input[name="name"]', 'Test Chase Checking');
    await page.selectOption('select[name="type"]', 'checking');
    await page.fill('input[name="balance"]', '500.00');
    await page.fill('input[name="currency"]', 'USD');
    await page.click('button:has-text("Create Account")');
    
    await page.waitForTimeout(1000);
    const accountCreated = await page.isVisible('text=Test Chase Checking');
    console.log("Account created successfully:", accountCreated);
    
    console.log("Navigating to budgets...");
    await page.goto('http://localhost:3000/budgets');
    
    console.log("Creating a category...");
    await page.fill('input[name="name"]', 'Dining Out Test');
    await page.selectOption('select[name="type"]', 'expense');
    await page.click('button:has-text("Create Category")');
    
    await page.waitForTimeout(1000);
    const categoryCreated = await page.isVisible('text=Dining Out Test');
    console.log("Category created successfully:", categoryCreated);
    
    console.log("Navigating to transactions...");
    await page.goto('http://localhost:3000/transactions');
    
    console.log("Creating a transaction...");
    await page.fill('input[name="amount"]', '15.50');
    await page.fill('input[name="merchant"]', 'Starbucks Test');
    await page.fill('input[name="date"]', '2026-06-18');
    
    // Get options for account and category
    await page.selectOption('select[name="accountId"]', { index: 1 }); // select first valid account
    await page.selectOption('select[name="categoryId"]', { index: 1 }); // select first valid category
    
    await page.click('button:has-text("Add Transaction")');
    
    await page.waitForTimeout(2000);
    const transactionCreated = await page.isVisible('text=Starbucks Test');
    console.log("Transaction created successfully:", transactionCreated);
    
    console.log("ALL TESTS PASSED SUCCESSFULLY!");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();
