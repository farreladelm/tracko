"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { fetchRecentReceipts } from "@/lib/gmail";
import { Expense } from "@/lib/parsers";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function syncReceiptsAction(): Promise<{ success: boolean; data?: Expense[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const newExpenses = await fetchRecentReceipts();
    
    // Save new expenses to the database
    if (newExpenses.length > 0) {
      await prisma.transaction.createMany({
        data: newExpenses.map(expense => ({
          userId: session.user.id,
          messageId: expense.messageId,
          transactionDate: expense.transactionDate,
          merchantName: expense.merchantName,
          amount: expense.amount,
          source: expense.source,
        })),
        skipDuplicates: true, // Safety check, though fetchRecentReceipts already filters
      });
    }

    // Fetch all transactions for this user from DB to return complete list
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { transactionDate: "desc" },
    });

    return { success: true, data: allTransactions as Expense[] };
  } catch (error) {
    console.error("Failed to sync receipts:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching receipts." 
    };
  }
}

export async function getTransactionsAction(): Promise<{ success: boolean; data?: Expense[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { transactionDate: "desc" },
    });

    return { success: true, data: transactions as Expense[] };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { success: false, error: "Failed to load transactions from database." };
  }
}
