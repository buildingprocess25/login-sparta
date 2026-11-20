import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "neutral" | "danger" | "warning"

const DOT_CLASS: Record<StatusTone, string> = {
  success: "bg-emerald-600 dark:bg-emerald-400",
  neutral: "bg-muted-foreground",
  danger: "bg-destructive",
  warning: "bg-amber-500",
}

type StatusBadgeProps = {
  label: string
  tone: StatusTone
}

/** Badge status dengan titik warna; warna hanya penanda, label tetap terbaca. */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <Badge variant="outline">
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", DOT_CLASS[tone])}
      />
      {label}
    </Badge>
  )
}
