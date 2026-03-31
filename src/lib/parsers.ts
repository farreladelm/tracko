import { z } from "zod";

export const ExpenseSchema = z.object({
  transactionDate: z.date(),
  merchantName: z.string().min(1),
  amount: z.number().positive(),
  source: z.enum(["MANDIRI", "BCA_BLU", "UNKNOWN"]),
  rawHtmlId: z.string().optional()
});

export type Expense = z.infer<typeof ExpenseSchema>;

/**
 * Parses raw HTML or text from an email body to extract QRIS transaction details.
 * This function uses flexible regex matching to accommodate varying bank email formats.
 */
export function parseReceipt(body: string, sender: string): Expense | null {
  try {
    const isMandiri = sender.toLowerCase().includes("mandiri");
    const isBlu = sender.toLowerCase().includes("blu") || sender.toLowerCase().includes("bcadigital");
    
    // Default to today if we can't parse the date easily
    let parsedDate = new Date();
    let merchantName = "Unknown Merchant";
    let amount = 0;

    // Convert HTML to Plain Text by adding spaces around block elements so words don't mash
    const plainText = body
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(div|p|td|tr|th|h[1-6]|li|table)>/gi, ' ')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (isMandiri) {
      // Mandiri Email parsing based on "Pembayaran Berhasil" format
      
      // Amount: "Nominal Transaksi Rp 56.940,00"
      const amountMatch = plainText.match(/Nominal Transaksi\s*(?:Rp|IDR)?\s*([\d\.\,]+)/i);
      if (amountMatch) {
        // Split by comma to ignore decimals (,00) then remove dots
        amount = parseInt(amountMatch[1].split(',')[0].replace(/\./g, ""), 10);
      }
      
      // Date: "Tanggal 30 Mar 2026 Jam 09:28:06 WIB"
      const dateMatch = plainText.match(/Tanggal\s+([\d]{1,2}\s+[A-Za-z]+\s+[\d]{4})/i);
      const timeMatch = plainText.match(/Jam\s+([\d]{2}:[\d]{2}:[\d]{2})/i);
      if (dateMatch) {
         const dateString = `${dateMatch[1]} ${timeMatch ? timeMatch[1] : '00:00:00'}`;
         parsedDate = new Date(dateString);
      }

      // Merchant: "Penerima SUPERINDO MKN QR - QRIS Surabaya (Kot - ID Tanggal"
      const merchantMatch = plainText.match(/Penerima\s+(.*?)\s+(?:Tanggal|Jam|Nominal Transaksi)/i);
      if (merchantMatch) {
        let rawMerchant = merchantMatch[1].trim();
        // Try to strip city identifiers that trail the merchant name (e.g. Surabaya, Jakarta, Kota, Kot)
        rawMerchant = rawMerchant.split(/\s+(?:Surabaya|Jakarta|Bandung|Kota|Kot\s*-|Kab(?:upaten)?)/i)[0];
        merchantName = rawMerchant.trim();
      }

    } else if (isBlu) {
      // BLU BCA Email parsing based on "transaksimu" format
      
      // Amount: "Nominal Tagihan Rp 17.000,00" or "Total Rp 17.000,00"
      const amountMatch = plainText.match(/(?:Nominal Tagihan|Total)\s*(?:Rp|IDR)?\s*([\d\.\,]+)/i);
      if (amountMatch) {
        // Split by comma to ignore decimals (,00) then remove dots
        amount = parseInt(amountMatch[1].split(',')[0].replace(/\./g, ""), 10);
      }
      
      // Date: "Tgl & Jam Transaksi 17 Mar 2026 18:10:50 WIB"
      const dateMatch = plainText.match(/Tgl & Jam Transaksi\s+([\d]{1,2}\s+[A-Za-z]+\s+[\d]{4}\s+[\d]{2}:[\d]{2}:[\d]{2})/i);
      if (dateMatch) {
        parsedDate = new Date(dateMatch[1].trim());
      }
      
      // Merchant: "Farrel Adel Mohammad bluSpending Warung Gunarso Surabaya (Kota) Nominal Tagihan"
      const merchantMatch = plainText.match(/bluSpending\s+(.*?)\s+Nominal Tagihan/i);
      if (merchantMatch) {
        let rawMerchant = merchantMatch[1].trim();
        // Remove known trailing city/bracket terms if present
        rawMerchant = rawMerchant.split(/\s+(?:Surabaya|Jakarta|Bandung|Kota|Kab)(?:\s*\(.*?\))?/i)[0];
        merchantName = rawMerchant.replace(/\((?:Kota|Kab).*?\)/gi, '').trim();
      } else {
        // Fallback for merchant name in BLU
        const fallbackMatch = plainText.match(/(?:QRIS|Merchant)\s+([A-Za-z0-9\s\.\,\-\&]+)(?:Nominal|Tgl)/i);
        if (fallbackMatch) {
          merchantName = fallbackMatch[1].trim();
        }
      }

    } else {
      // Generic fallback for other bank formats
      const amountMatch = plainText.match(/Rp\s*([\d\.\,]+)/i);
      if (amountMatch) amount = parseInt(amountMatch[1].split(',')[0].replace(/\./g, ""), 10);
      
      const merchantMatch = plainText.match(/(?:merchant|nama merchant|tujuan|penerima|kepada)[\s:]*([A-Za-z0-9\s\.\,\-\&]+?)(?:\s+(?:tanggal|rp|nominal|jumlah|<|$))/i);
      if (merchantMatch) merchantName = merchantMatch[1].trim();
    }

    if (amount === 0) {
      return null;
    }

    const data: Expense = {
      transactionDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      merchantName: merchantName,
      amount: amount,
      source: isMandiri ? "MANDIRI" : isBlu ? "BCA_BLU" : "UNKNOWN"
    }
    
    return ExpenseSchema.parse(data);
  } catch (error) {
    console.error("Failed to parse receipt:", error);
    return null;
  }
}
