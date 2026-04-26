import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
