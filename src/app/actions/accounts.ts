"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  balance: z.coerce.number(),
  currency: z.string().default("IDR"),
});

export async function createAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const data = {
    name: formData.get("name"),
    type: formData.get("type"),
    balance: formData.get("balance"),
    currency: formData.get("currency") || "IDR",
  };

  const parsed = accountSchema.parse(data);

  await prisma.financialAccount.create({
    data: {
      name: parsed.name,
      type: parsed.type,
      balance: parsed.balance,
      userId: user.id,
    }
  });

  revalidatePath("/accounts");
}
