import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import {
  getGmailClient,
  fetchRecentBankEmails,
  getEmailMessage,
  extractBodyText,
  getFromHeader,
  parseEmailFromHeader
} from "@/lib/gmail";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SupportedBank {
  sender: string;
  keywords: string[];
}

const SUPPORTED_BANKS: SupportedBank[] = [
  {
    sender: "receipts@blubybcadigital.id",
    keywords: ["blu", "bca"],
  },
  {
    sender: "noreply.livin@bankmandiri.co.id",
    keywords: ["mandiri", "livin"],
  },
];

export async function GET(req: Request) {
  console.log("[cron/gmail-sync] GET request received");
  
  // Security check: Must pass the CRON_SECRET in the Authorization header
  const authHeader = req.headers.get("Authorization");
  console.log("[cron/gmail-sync] Authorization header:", authHeader ? "Present" : "Missing");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[cron/gmail-sync] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron/gmail-sync] Fetching users who connected Gmail...");
    // 1. Get all users who have connected their Gmail
    const credentials = await prisma.gmailCredential.findMany({
      include: { user: { include: { financialAccounts: true, categories: true } } }
    });
    console.log(`[cron/gmail-sync] Found ${credentials.length} credentials`);

    let processedCount = 0;

    // Build standard Gmail search query targeting only the supported senders in the last 1 day
    const senderQuery = SUPPORTED_BANKS.map(b => `from:${b.sender}`).join(" OR ");
    const query = `newer_than:1d (${senderQuery})`;
    console.log("[cron/gmail-sync] Gmail search query:", query);

    for (const cred of credentials) {
      try {
        console.log(`[cron/gmail-sync] Processing user ID: ${cred.userId}`);
        
        // Skip if user has no accounts to tie the transactions to
        if (cred.user.financialAccounts.length === 0) {
          console.log(`[cron/gmail-sync] User ${cred.userId} has no financial accounts. Skipping.`);
          continue; 
        }

        console.log("[cron/gmail-sync] Decrypting refresh token...");
        const refreshToken = decrypt(cred.encryptedToken, cred.iv, cred.authTag);
        
        console.log("[cron/gmail-sync] Initializing Gmail client...");
        const gmail = getGmailClient(refreshToken);
        
        console.log("[cron/gmail-sync] Fetching recent emails...");
        const messages = await fetchRecentBankEmails(gmail, query);
        console.log(`[cron/gmail-sync] Fetched ${messages.length} recent messages`);

        for (const msg of messages) {
          if (!msg.id) continue;
          console.log(`[cron/gmail-sync] Checking message ID: ${msg.id}`);
          
          // Skip if we already processed this message
          const exists = await prisma.processedEmail.findUnique({
            where: {
              userId_messageId: {
                userId: cred.userId,
                messageId: msg.id
              }
            }
          });
          if (exists) {
            console.log(`[cron/gmail-sync] Message ${msg.id} already processed. Skipping.`);
            continue;
          }

          console.log(`[cron/gmail-sync] Message ${msg.id} is new. Fetching full details...`);
          const fullMsg = await getEmailMessage(gmail, msg.id);
          
          console.log("[cron/gmail-sync] Extracting From header...");
          const fromHeader = getFromHeader(fullMsg.payload);
          const senderEmail = parseEmailFromHeader(fromHeader);
          console.log(`[cron/gmail-sync] Sender email: ${senderEmail}`);

          // Strict sender match validation
          const bankConfig = SUPPORTED_BANKS.find(b => b.sender === senderEmail);
          if (!bankConfig) {
            console.log(`[cron/gmail-sync] Sender ${senderEmail} is not in supported list. Skipping.`);
            continue;
          }

          console.log("[cron/gmail-sync] Extracting body text...");
          const emailText = fullMsg.payload ? extractBodyText(fullMsg.payload) : "";
          console.log(`[cron/gmail-sync] Extracted body text length: ${emailText.length}`);

          if (!emailText || emailText.length < 20) {
            console.log("[cron/gmail-sync] Body text is too short. Skipping.");
            continue; 
          }
          
          // Pre-filter: Ensure email contains money-related keywords before calling Gemini to save API costs
          const hasKeywords = !!emailText.toLowerCase().match(/(paid|receipt|payment|transaction|spent|total|amount|order|pembayaran|transaksi|nominal|berhasil|transfer|debit|kredit|jumlah|diterima|dikirim|penerima)/);
          console.log(`[cron/gmail-sync] Keyword match check: ${hasKeywords}`);
          if (!hasKeywords) {
            console.log("[cron/gmail-sync] Email does not match money keywords. Skipping.");
            continue;
          }

          // 2. Parse with Gemini Structured Outputs
          console.log("[cron/gmail-sync] Defining Gemini output schema...");
          const schema: Schema = {
            type: Type.OBJECT,
            properties: {
              isTransaction: { type: Type.BOOLEAN, description: "True if this email is a receipt or transaction notification" },
              amount: { type: Type.NUMBER, description: "The transaction amount (positive number)" },
              merchant: { type: Type.STRING, description: "The name of the merchant or sender" },
              date: { type: Type.STRING, description: "The date of the transaction in ISO format (YYYY-MM-DD)" },
            },
            required: ["isTransaction", "amount", "merchant", "date"],
          };

          let response;
          try {
            console.log("[cron/gmail-sync] Calling Gemini API...");
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `Extract the transaction details from this email text:\n\n${emailText}`,
              config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0,
              }
            });
            console.log("[cron/gmail-sync] Gemini API response received");
          } catch (apiError) {
            console.error("[cron/gmail-sync] Gemini API Error for email ID", msg.id, apiError);
            // Skip this email and let the next cron run retry it
            continue;
          }

          if (response?.text) {
            try {
              console.log("[cron/gmail-sync] Parsing Gemini output:", response.text);
              const extracted = JSON.parse(response.text);
              if (extracted.isTransaction && extracted.amount > 0) {
                console.log("[cron/gmail-sync] Valid transaction extracted. Finding account...");
                // Smart Account Routing
                let targetAccount = cred.user.financialAccounts.find(acc => {
                  const accNameLower = acc.name.toLowerCase();
                  return bankConfig.keywords.some(keyword => accNameLower.includes(keyword));
                });

                // Fallback to the first financial account if no match is found
                if (!targetAccount) {
                  targetAccount = cred.user.financialAccounts[0];
                  console.log(`[cron/gmail-sync] Account match not found. Falling back to default: ${targetAccount.name}`);
                } else {
                  console.log(`[cron/gmail-sync] Account match found: ${targetAccount.name}`);
                }

                // 3. Save to database as DRAFT (do not update balance yet) and mark email as processed
                console.log("[cron/gmail-sync] Creating transaction in database and marking email as processed...");
                await prisma.$transaction([
                  prisma.transaction.create({
                    data: {
                      userId: cred.userId,
                      accountId: targetAccount.id,
                      amount: -extracted.amount, // Representing expense as negative
                      note: extracted.merchant,
                      date: new Date(extracted.date),
                      receiptUrl: msg.id, // Store message ID to prevent duplicates
                      type: "EXPENSE",
                      status: "DRAFT"
                    }
                  }),
                  prisma.processedEmail.create({
                    data: {
                      userId: cred.userId,
                      messageId: msg.id
                    }
                  })
                ]);
                console.log("[cron/gmail-sync] Transaction saved and email marked as processed successfully");

                processedCount++;
              } else {
                console.log("[cron/gmail-sync] Extracted content is not a transaction or amount <= 0. Marking email as processed...");
                await prisma.processedEmail.create({
                  data: {
                    userId: cred.userId,
                    messageId: msg.id
                  }
                });
              }
            } catch (e) {
              console.error("[cron/gmail-sync] Failed to parse or save transaction", e);
              if (e instanceof SyntaxError) {
                try {
                  await prisma.processedEmail.create({
                    data: {
                      userId: cred.userId,
                      messageId: msg.id
                    }
                  });
                } catch (dbErr) {
                  console.error("[cron/gmail-sync] Failed to save ProcessedEmail for parse failure:", dbErr);
                }
              }
            }
          } else {
            console.warn("[cron/gmail-sync] Gemini returned empty response text");
          }
        }
      } catch (userError) {
        console.error(`[cron/gmail-sync] Failed to sync for user ${cred.userId}:`, userError);
      }
    }

    console.log(`[cron/gmail-sync] Sync completed. Processed ${processedCount} transactions.`);
    return NextResponse.json({ success: true, processedTransactions: processedCount });
  } catch (error) {
    console.error("[cron/gmail-sync] Cron Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
