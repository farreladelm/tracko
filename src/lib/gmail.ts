import { google, gmail_v1 } from "googleapis";

/**
 * Initialize and authenticate the Gmail API client.
 */
export function getGmailClient(refreshToken: string): gmail_v1.Gmail {
  console.log("[lib/gmail] Initializing OAuth2 client...");
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetch list of recent email messages matching a search query.
 */
export async function fetchRecentBankEmails(
  gmail: gmail_v1.Gmail,
  query: string,
  maxResults = 15
): Promise<gmail_v1.Schema$Message[]> {
  console.log(`[lib/gmail] Listing messages with query "${query}" (max ${maxResults})...`);
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });
  const msgs = res.data.messages || [];
  console.log(`[lib/gmail] Found ${msgs.length} messages`);
  return msgs;
}

/**
 * Fetch the full email message metadata and body content.
 */
export async function getEmailMessage(
  gmail: gmail_v1.Gmail,
  messageId: string
): Promise<gmail_v1.Schema$Message> {
  console.log(`[lib/gmail] Getting full message for ID: ${messageId}...`);
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });
  return res.data;
}

/**
 * Recursively find a part with the given mimeType in the message part tree.
 */
export function findPartByMimeType(
  part: gmail_v1.Schema$MessagePart,
  mimeType: string,
  depth = 0
): gmail_v1.Schema$MessagePart | null {
  if (depth > 10) return null;
  if (part.mimeType === mimeType && part.body?.data) {
    return part;
  }
  if (part.parts) {
    for (const subPart of part.parts) {
      const found = findPartByMimeType(subPart, mimeType, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Strips HTML tags and collapses whitespace.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts plain text from the message payload.
 * First looks for a text/plain part. If not found, falls back to text/html and strips tags.
 */
export function extractBodyText(payload: gmail_v1.Schema$MessagePart): string {
  // 1. Try text/plain
  const plainPart = findPartByMimeType(payload, "text/plain");
  if (plainPart?.body?.data) {
    try {
      return Buffer.from(plainPart.body.data, "base64url").toString("utf8");
    } catch (err) {
      console.error("[lib/gmail] Failed to decode base64 text/plain body", err);
    }
  }

  // 2. Try text/html
  const htmlPart = findPartByMimeType(payload, "text/html");
  if (htmlPart?.body?.data) {
    try {
      const html = Buffer.from(htmlPart.body.data, "base64url").toString("utf8");
      return stripHtml(html);
    } catch (err) {
      console.error("[lib/gmail] Failed to decode base64 text/html body", err);
    }
  }

  return "";
}

/**
 * Extract the From header value from the email payload.
 */
export function getFromHeader(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload?.headers) return "";
  const header = payload.headers.find(h => h.name?.toLowerCase() === 'from');
  return header?.value || "";
}

/**
 * Extract the clean email address from a From header value.
 * e.g., "Blu <receipts@blubybcadigital.id>" -> "receipts@blubybcadigital.id"
 */
export function parseEmailFromHeader(fromValue: string): string {
  const match = fromValue.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim().toLowerCase();
  }
  return fromValue.trim().toLowerCase();
}
