import { Expense } from "./parsers";

/**
 * Converts an array of expenses into a CSV string and triggers a browser download.
 */
export function exportToCsv(expenses: Expense[]): void {
  if (!expenses || expenses.length === 0) return;

  const headers = ["Date", "Merchant Name", "Amount (IDR)", "Source"];

  const rows = expenses.map(expense => {
    // Format date as YYYY-MM-DD HH:mm:ss if it's a valid date object
    let dateStr = "";
    if (expense.transactionDate instanceof Date && !isNaN(expense.transactionDate.getTime())) {
      dateStr = expense.transactionDate.toISOString().replace('T', ' ').substring(0, 19);
    } else {
      dateStr = String(expense.transactionDate);
    }

    // Escape any quotes in the merchant name
    const safeMerchantName = `"${expense.merchantName.replace(/"/g, '""')}"`;

    return [
      dateStr,
      safeMerchantName,
      expense.amount,
      expense.source
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `qris_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
