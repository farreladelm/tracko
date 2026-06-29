"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Deletes the user's GmailCredential record from the database to disconnect Gmail sync.
 */
export async function disconnectGmail() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) throw new Error("User not found");

  await prisma.gmailCredential.deleteMany({
    where: { userId: user.id }
  });

  revalidatePath("/settings");
}
