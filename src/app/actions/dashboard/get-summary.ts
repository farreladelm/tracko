"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const summarySchema = z.object({
  thisMonth: z.object({
    total: z.number(),
    count: z.number(),
    bySource: z.record(z.string(), z.number())
  }),
  lastMonth: z.object({
    total: z.number(),
    count: z.number()
  }),
  percentageChange: z.number().nullable(),
  topMerchants: z.array(z.object({
    merchantName: z.string(),
    total: z.number(),
    count: z.number()
  }))
})

export type SummaryData = z.infer<typeof summarySchema>

export async function getSummary() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id
  const now = new Date()
  
  // Start of this month
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  // Start of next month (exclusive)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  // Start of last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  // End of last month is start of this month (exclusive)
  const endOfLastMonth = startOfThisMonth

  try {
    // Current month transactions
    const thisMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: startOfThisMonth,
          lt: startOfNextMonth
        }
      }
    })

    // Last month transactions
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    })

    // Aggregates for this month
    const thisMonthTotal = thisMonthTransactions.reduce((acc, t) => acc + t.amount, 0)
    const thisMonthCount = thisMonthTransactions.length
    const thisMonthBySource = thisMonthTransactions.reduce((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    // Aggregates for last month
    const lastMonthTotal = lastMonthTransactions.reduce((acc, t) => acc + t.amount, 0)
    const lastMonthCount = lastMonthTransactions.length

    // Percentage change
    const percentageChange = lastMonthTotal === 0 
      ? null 
      : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100

    // Top merchants this month
    const merchantMap = thisMonthTransactions.reduce((acc, t) => {
      if (!acc[t.merchantName]) {
        acc[t.merchantName] = { total: 0, count: 0 }
      }
      acc[t.merchantName].total += t.amount
      acc[t.merchantName].count += 1
      return acc
    }, {} as Record<string, { total: number, count: number }>)

    const topMerchants = Object.entries(merchantMap)
      .map(([merchantName, data]) => ({
        merchantName,
        ...data
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)

    const result = {
      thisMonth: {
        total: thisMonthTotal,
        count: thisMonthCount,
        bySource: {
          MANDIRI: thisMonthBySource["MANDIRI"] || 0,
          BCA_BLU: thisMonthBySource["BCA_BLU"] || 0,
          UNKNOWN: thisMonthBySource["UNKNOWN"] || 0
        }
      },
      lastMonth: {
        total: lastMonthTotal,
        count: lastMonthCount
      },
      percentageChange,
      topMerchants
    }

    return { data: summarySchema.parse(result) }
  } catch (error) {
    console.error("Error fetching summary:", error)
    return { error: "Failed to load summary" }
  }
}
