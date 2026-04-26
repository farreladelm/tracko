import { google } from 'googleapis';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { parseReceipt, Expense } from './parsers';

export async function fetchRecentReceipts(limit: number = 50): Promise<Expense[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated.");
  }

  // Fetch tokens from DB for the current user
  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" }
  });

  if (!account?.access_token) {
    throw new Error("Missing Gmail access token in database. Please sign in again.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );
  
  oauth2Client.setCredentials({ 
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Search for emails containing "QRIS" from either bank
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: '(from:noreply.livin@bankmandiri.co.id OR from:receipts@blubybcadigital.id) QRIS',
    maxResults: limit
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) return [];

  // Optimization: Check which message IDs we already have in the DB to avoid redundant fetching
  const messageIds = messages.map(m => m.id as string).filter(Boolean);
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      messageId: { in: messageIds }
    },
    select: { messageId: true }
  });
  
  const existingIds = new Set(existingTransactions.map(t => t.messageId));
  const newMessages = messages.filter(m => m.id && !existingIds.has(m.id));

  const expenses: Expense[] = [];

  // Parallelize the fetching of individual email messages (ONLY new ones)
  const fetchPromises = newMessages.map(async (message) => {
    if (!message.id) return null;
    
    try {
      // Fetch the full email content
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const payload = msgData.data.payload;
      const headers = payload?.headers || [];
      
      // Get the sender
      const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      
      // Extract body content (usually base64url encoded)
      let bodyData = "";
      
      // If the email has a body immediately (plain text)
      if (payload?.body?.data) {
        bodyData = payload.body.data;
      } 
      // If it's multipart (HTML + Plaintext)
      else if (payload?.parts && payload.parts.length > 0) {
        // Look for HTML part first, then fall back to plain text
        const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        
        const partToRead = htmlPart || textPart || payload.parts[0];
        
        if (partToRead?.body?.data) {
          bodyData = partToRead.body.data;
        } else if (partToRead?.parts && partToRead.parts[0]?.body?.data) {
          // Nested parts (e.g. multipart/alternative inside multipart/related)
          bodyData = partToRead.parts[0].body.data;
        }
      }

      if (bodyData) {
        // Decode base64url 
        const decodedBody = Buffer.from(bodyData, 'base64url').toString('utf-8');

        return parseReceipt(decodedBody, fromHeader, message.id);
      }
    } catch (err) {
      console.error(`Error processing message ${message.id}:`, err);
    }
    return null;
  });

  // Evaluate all network requests concurrently
  const results = await Promise.all(fetchPromises);
  
  // Filter out any null failures and push to expenses array
  for (const result of results) {
    if (result) {
        expenses.push(result);
    }
  }

  return expenses;
}
