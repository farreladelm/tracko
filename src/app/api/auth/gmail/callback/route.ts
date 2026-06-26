import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return redirect("/auth/signin");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) return redirect("/settings?error=NoCode");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Fetch the email address of the connected account
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const connectedEmail = profile.data.emailAddress;
    
    if (tokens.refresh_token && connectedEmail) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email }});
      if (user) {
        const encrypted = encrypt(tokens.refresh_token);
        
        await prisma.gmailCredential.upsert({
          where: { userId: user.id },
          update: {
            encryptedToken: encrypted.encryptedToken,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
          },
          create: {
            userId: user.id,
            encryptedToken: encrypted.encryptedToken,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
          }
        });
      }
    }
  } catch (error) {
    console.error("OAuth callback error", error);
    return redirect("/settings?error=OAuthFailed");
  }

  redirect("/settings?success=1");
}
