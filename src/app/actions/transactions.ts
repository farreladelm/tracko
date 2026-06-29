"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number(),
  date: z.string().min(1, "Date is required"),
  merchant: z.string().min(1, "Merchant is required"),
  description: z.string().optional().nullable(),
});

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const data = {
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId") || null,
    amount: formData.get("amount"),
    date: formData.get("date"),
    merchant: formData.get("merchant"),
    description: formData.get("description"),
  };

  const parsed = transactionSchema.parse(data);

  // Validate that the financial account belongs to the user
  const account = await prisma.financialAccount.findFirst({
    where: { id: parsed.accountId, userId: user.id }
  });
  if (!account) throw new Error("Account not found or unauthorized");

  // Validate that the category belongs to the user (if categoryId is provided)
  if (parsed.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: parsed.categoryId, userId: user.id }
    });
    if (!category) throw new Error("Category not found or unauthorized");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: parsed.accountId,
        categoryId: parsed.categoryId,
        amount: parsed.amount,
        note: parsed.merchant,
        date: new Date(parsed.date),
        type: parsed.amount >= 0 ? "INCOME" : "EXPENSE",
        status: "CONFIRMED"
      }
    }),
    prisma.financialAccount.update({
      where: { id: parsed.accountId },
      data: {
        balance: {
          increment: parsed.amount
        }
      }
    })
  ]);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(transactionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Fetch the transaction to verify ownership and ensure account matches
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: user.id },
    include: { account: true }
  });
  if (!transaction) throw new Error("Transaction not found or unauthorized");

  const deleteOp = prisma.transaction.delete({
    where: { id: transactionId }
  });

  // Only revert balance changes if the transaction was already confirmed
  if (transaction.status === "CONFIRMED") {
    const updateOp = prisma.financialAccount.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          decrement: transaction.amount // Revert the original balance change
        }
      }
    });
    await prisma.$transaction([deleteOp, updateOp]);
  } else {
    await prisma.$transaction([deleteOp]);
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function confirmTransaction(transactionId: string, accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Fetch the transaction to verify ownership and check its status
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: user.id }
  });
  if (!transaction) throw new Error("Transaction not found or unauthorized");
  if (transaction.status === "CONFIRMED") throw new Error("Transaction is already confirmed");

  // Verify that the chosen financial account belongs to the user
  const account = await prisma.financialAccount.findFirst({
    where: { id: accountId, userId: user.id }
  });
  if (!account) throw new Error("Account not found or unauthorized");

  // Update status to CONFIRMED and apply balance change
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "CONFIRMED",
        accountId: accountId
      }
    }),
    prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: transaction.amount
        }
      }
    })
  ]);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function confirmTransactionForm(formData: FormData) {
  const transactionId = formData.get("transactionId") as string;
  const accountId = formData.get("accountId") as string;
  if (!transactionId || !accountId) throw new Error("Missing parameters");
  await confirmTransaction(transactionId, accountId);
}

export async function deleteTransactionForm(formData: FormData) {
  const transactionId = formData.get("transactionId") as string;
  if (!transactionId) throw new Error("Missing parameters");
  await deleteTransaction(transactionId);
}


