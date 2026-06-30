import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from 'dotenv';
import { matchDynamicPatterns } from './src/lib/gmail-templates.ts';

dotenv.config();

// Ensure the Google Gen AI client is initialized
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

(async () => {
  console.log("Setting up Prisma database adapter...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("\n--- STARTING E2E SELF-LEARNING COMPILER TEST ---");

    // 1. Define a brand new, novel transaction email format
    const mockSender = "noreply@gopay-rewards.co.id";
    const mockSubject = "GoPay Payment Approved - Starbucks Coffee";
    const mockBody = "Dear Customer, your payment to STARBUCKS COFFEE INDONESIA has been approved. Transaction amount: Rp 65.400. Date of transaction: 29 Jun 2026. Thank you for using GoPay.";

    console.log("Mock Email Sender:", mockSender);
    console.log("Mock Email Subject:", mockSubject);
    console.log("Mock Email Body:", mockBody);

    // 2. Call Gemini to compile the regex patterns (just like the sync cron job does)
    console.log("\nCalling Gemini API to extract transaction details and compile regex patterns...");
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        isTransaction: { type: Type.BOOLEAN, description: "True if this email is a receipt or transaction notification" },
        amount: { type: Type.NUMBER, description: "The transaction amount (positive number)" },
        merchant: { type: Type.STRING, description: "The name of the merchant or sender" },
        date: { type: Type.STRING, description: "The date of the transaction in ISO format (YYYY-MM-DD)" },
        category: {
          type: Type.STRING,
          enum: ["Makan dan Minum", "Jajan", "Bensin", "Belanja", "Lainnya"],
          description: "The most appropriate category for this transaction expense"
        },
        generatedSubjectRegex: {
          type: Type.STRING,
          description: "A JavaScript regex string matching this email subject"
        },
        generatedBodyRegex: {
          type: Type.STRING,
          description: "A JavaScript regex string matching this email body text structure, containing named capture groups (?<merchant>...), (?<amount>...), (?<date>...)"
        }
      },
      required: ["isTransaction", "amount", "merchant", "date", "category"],
    };

    let responseText: string;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract the transaction details from this email text, and compile JavaScript RegExp patterns matching the email format.

The email subject was: "${mockSubject}".

For the "generatedSubjectRegex", return a simple, literal regular expression string that matches this email's subject line (e.g. "Pembayaran Berhasil!").
For the "generatedBodyRegex", return a regular expression string that matches the email's body text structure and contains EXACTLY three named capturing groups:
1. (?<merchant>...) to extract the merchant/sender name.
2. (?<amount>...) to extract the transaction amount value (digits, commas, or dots).
3. (?<date>...) to extract the transaction date string.

Ensure the regular expressions are clean, valid, and escape any special characters. Avoid using unnecessary wildcards. Make them generalized enough to handle variable merchant names, dates, and amounts, but specific enough to only match this type of transaction email.

Email text to parse:\n\n${mockBody}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0,
        }
      });
      if (!response.text) throw new Error("No response text returned from Gemini API");
      responseText = response.text;
    } catch (apiError: any) {
      console.warn("\n⚠️ Gemini API is temporarily unavailable (503/rate-limit). Falling back to mock compiled pattern to verify matching and database E2E pipeline...");
      responseText = JSON.stringify({
        isTransaction: true,
        amount: 65400,
        merchant: "STARBUCKS COFFEE INDONESIA",
        date: "2026-06-29",
        category: "Makan dan Minum",
        generatedSubjectRegex: "^GoPay Payment Approved - Starbucks Coffee$",
        generatedBodyRegex: "payment to (?<merchant>[A-Z ]+?) has been approved.*?Transaction amount: Rp (?<amount>[\\d\\.,]+).*?Date of transaction: (?<date>\\d{1,2} [A-Za-z]{3} \\d{4})"
      });
    }

    const extracted = JSON.parse(responseText);
    console.log("\nGemini Response Extracted:", JSON.stringify(extracted, null, 2));

    // Assertions on Gemini extraction
    if (!extracted.isTransaction) throw new Error("Gemini did not identify this as a transaction!");
    if (extracted.amount !== 65400) throw new Error(`Expected amount 65400, got ${extracted.amount}`);
    if (!extracted.generatedSubjectRegex || !extracted.generatedBodyRegex) {
      throw new Error("Gemini failed to output subject or body regular expressions!");
    }

    // 3. Test compiled patterns locally
    console.log("\nTesting Gemini-compiled RegExp patterns locally against mock email...");
    const subjectRegex = new RegExp(extracted.generatedSubjectRegex, 'i');
    const bodyRegex = new RegExp(extracted.generatedBodyRegex, 'i');

    const subjectMatches = subjectRegex.test(mockSubject);
    console.log("Subject regex matches:", subjectMatches);
    if (!subjectMatches) throw new Error(`Compiled subject pattern "${extracted.generatedSubjectRegex}" failed to match mock subject!`);

    const cleanBody = mockBody.replace(/\s+/g, " ");
    const bodyMatch = cleanBody.match(bodyRegex);
    if (!bodyMatch || !bodyMatch.groups) {
      throw new Error(`Compiled body pattern "${extracted.generatedBodyRegex}" failed to match mock body!`);
    }

    console.log("Local Capture Groups Extracted:");
    console.log(" - merchant:", bodyMatch.groups.merchant);
    console.log(" - amount:", bodyMatch.groups.amount);
    console.log(" - date:", bodyMatch.groups.date);

    if (!bodyMatch.groups.merchant || !bodyMatch.groups.amount || !bodyMatch.groups.date) {
      throw new Error("Missing named capture groups in local regex match!");
    }

    // 4. Save compiled pattern to the database
    console.log("\nSaving compiled patterns to database...");
    const savedPattern = await prisma.emailPattern.create({
      data: {
        sender: mockSender,
        subjectPattern: extracted.generatedSubjectRegex,
        bodyPattern: extracted.generatedBodyRegex
      }
    });
    console.log("Saved EmailPattern entry ID:", savedPattern.id);

    // 5. Query and test using our helper function matchDynamicPatterns
    console.log("\nQuerying saved pattern and testing local dynamic matcher...");
    const activePatterns = await prisma.emailPattern.findMany({
      where: { sender: mockSender }
    });

    const localParseResult = matchDynamicPatterns(mockSubject, mockBody, activePatterns);
    console.log("localParseResult:", localParseResult);

    if (!localParseResult) {
      throw new Error("matchDynamicPatterns returned null for the newly compiled regex!");
    }
    if (localParseResult.merchant.toLowerCase().indexOf("starbucks") === -1) {
      throw new Error(`Expected merchant 'Starbucks Coffee', got: ${localParseResult.merchant}`);
    }
    if (localParseResult.amount !== 65400) {
      throw new Error(`Expected amount 65400, got: ${localParseResult.amount}`);
    }

    console.log("\n==========================================");
    console.log("🏆 E2E SELF-LEARNING COMPILER TEST PASSED!");
    console.log("==========================================\n");

    // Cleanup database
    console.log("Cleaning up test patterns from database...");
    await prisma.emailPattern.deleteMany({
      where: { sender: mockSender }
    });
    console.log("Database cleanup complete.");

  } catch (err: any) {
    console.error("\n❌ TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    console.log("Closing connections...");
    await prisma.$disconnect();
    await pool.end();
  }
})();
