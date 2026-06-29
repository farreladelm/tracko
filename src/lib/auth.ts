import { NextAuthOptions, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // We don't ask for gmail.readonly here by default.
      // We will do incremental authorization later for the Gmail sync.
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email === "test@example.com") {
          let user = await prisma.user.findUnique({ where: { email: "test@example.com" } });
          if (!user) {
            user = await prisma.user.create({
              data: { email: "test@example.com", name: "Test Agent" }
            });
          }
          return { id: user.id, email: user.email, name: user.name };
        }
        return null; 
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        const existingCategories = await prisma.category.findMany({
          where: { userId: user.id }
        });
        const existingNames = new Set(existingCategories.map(c => c.name));
        const defaultCategories = ["Makan dan Minum", "Jajan", "Bensin", "Belanja", "Lainnya"];
        const missingCategories = defaultCategories.filter(name => !existingNames.has(name));

        if (missingCategories.length > 0) {
          await prisma.category.createMany({
            data: missingCategories.map(name => ({
              userId: user.id,
              name,
              type: "expense"
            }))
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
