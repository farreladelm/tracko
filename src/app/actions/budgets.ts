"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense", "transfer"]),
});

export async function createCategory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const data = {
    name: formData.get("name"),
    type: formData.get("type"),
  };

  const parsed = categorySchema.parse(data);

  await prisma.category.create({
    data: {
      ...parsed,
      userId: user.id,
    }
  });

  revalidatePath("/budgets");
}

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(["monthly", "yearly"]),
});

export async function createBudget(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const data = {
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    period: formData.get("period"),
  };

  const parsed = budgetSchema.parse(data);

  // Validate that the category belongs to the user
  const category = await prisma.category.findFirst({
    where: { id: parsed.categoryId, userId: user.id }
  });
  if (!category) throw new Error("Category not found or unauthorized");

  // We map the abstract period to the current month for the Prisma schema
  const currentMonth = new Date().toISOString().substring(0, 7);

  await prisma.budget.create({
    data: {
      categoryId: parsed.categoryId,
      amount: parsed.amount,
      month: currentMonth,
      userId: user.id,
    }
  });

  revalidatePath("/budgets");
}
