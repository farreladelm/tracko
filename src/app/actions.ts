"use server";

import { fetchRecentReceipts } from "@/lib/gmail";
import { Expense } from "@/lib/parsers";

export async function syncReceiptsAction(): Promise<{ success: boolean; data?: Expense[]; error?: string }> {
  try {
    const expenses = await fetchRecentReceipts();
    return { success: true, data: expenses };
  } catch (error: any) {
    console.error("Failed to sync receipts:", error);
    return { 
      success: false, 
      error: error?.message || "An unknown error occurred while fetching receipts." 
    };
  }
}
