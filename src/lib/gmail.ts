import { google } from 'googleapis';
import { auth } from '@/auth';
import { parseReceipt, Expense } from './parsers';

export async function fetchRecentReceipts(limit: number = 50): Promise<Expense[]> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated or missing Gmail access token.");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Search for emails containing "QRIS" from either bank
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: '(from:noreply.livin@bankmandiri.co.id OR from:receipts@blubybcadigital.id) QRIS',
    maxResults: limit
  });

  const messages = res.data.messages || [];
  const expenses: Expense[] = [];

  // Parallelize the fetching of individual email messages
  const fetchPromises = messages.map(async (message) => {
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

        return parseReceipt(decodedBody, fromHeader);
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
