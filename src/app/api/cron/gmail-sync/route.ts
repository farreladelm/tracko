import { NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  // Security check: Must pass the CRON_SECRET in the Authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get all users who have connected their Gmail
    const credentials = await prisma.gmailCredential.findMany({
      include: { user: { include: { financialAccounts: true, categories: true } } }
    });

    let processedCount = 0;

    for (const cred of credentials) {
      // Skip if user has no accounts to tie the transactions to
      if (cred.user.financialAccounts.length === 0) continue; 

      const refreshToken = decrypt(cred.encryptedToken, cred.iv, cred.authTag);
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      // Fetch recent emails from the last 1 day
      const res = await gmail.users.messages.list({ userId: 'me', q: "newer_than:1d", maxResults: 15 });
      const messages = res.data.messages || [];

      for (const msg of messages) {
        if (!msg.id) continue;
        
        // Skip if we already processed this message (assuming we use receiptUrl to store msg id for simplicity in MVP)
        const exists = await prisma.transaction.findFirst({ where: { receiptUrl: msg.id, userId: cred.userId } });
        if (exists) continue;

        const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
        
        // Extract plain text from email body
        let emailText = "";
        const parts = fullMsg.data.payload?.parts;
        if (parts) {
          const textPart = parts.find(p => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            emailText = Buffer.from(textPart.body.data, 'base64').toString('utf8');
          }
        } else if (fullMsg.data.payload?.body?.data) {
          emailText = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf8');
        }

        if (!emailText || emailText.length < 20) continue; 
        
        // Pre-filter: Ensure email contains money-related keywords before calling Gemini to save API costs
        if (!emailText.toLowerCase().match(/(paid|receipt|payment|transaction|spent|total|amount|order)/)) continue;

        // 2. Parse with Gemini Structured Outputs
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
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extract the transaction details from this email text:\n\n${emailText}`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
              temperature: 0,
            }
          });
        } catch (apiError) {
          console.error("Gemini API Error for email ID", msg.id, apiError);
          // Skip this email and let the next cron run retry it
          continue;
        }

        if (response?.text) {
          try {
            const extracted = JSON.parse(response.text);
            if (extracted.isTransaction && extracted.amount > 0) {
              const defaultAccount = cred.user.financialAccounts[0];

              // 3. Save to database
              await prisma.transaction.create({
                data: {
                  userId: cred.userId,
                  accountId: defaultAccount.id,
                  amount: -extracted.amount, // Representing expense as negative
                  note: extracted.merchant,
                  date: new Date(extracted.date),
                  receiptUrl: msg.id, // Store message ID to prevent duplicates
                  type: "EXPENSE",
                  status: "CONFIRMED"
                }
              });

              // Update account balance
              await prisma.financialAccount.update({
                where: { id: defaultAccount.id },
                data: { balance: { decrement: extracted.amount } }
              });

              processedCount++;
            }
          } catch (e) {
            console.error("Failed to parse or save transaction", e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processedTransactions: processedCount });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
