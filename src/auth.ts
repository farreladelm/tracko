import NextAuth, { type DefaultSession } from "next-auth"
import { type JWT } from "next-auth/jwt"
import Google from "next-auth/providers/google"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: "RefreshTokenError"
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string
    expires_at?: number
    refresh_token?: string
    error?: "RefreshTokenError"
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First login, save tokens
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        }
      } else if (token.expires_at && Date.now() < token.expires_at * 1000) {
        // Token still valid
        return token
      }
      return token
    },
    async session({ session, token }) {
      // Expose the access token to our server-side API calls
      session.accessToken = token.access_token as string | undefined
      session.error = token.error
      if (typeof token.sub === "string") {
        session.user.id = token.sub
      }
      return session
    }
  }
})
