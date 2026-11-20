import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatTone = "neutral" | "primary" | "success" | "danger"

const TONE_CLASS: Record<StatTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  danger: "bg-destructive/10 text-destructive",
}

type StatCardProps = {
  label: string
  value: number
  icon: LucideIcon
  tone?: StatTone
  /** Teks kecil di bawah angka, misalnya penjelasan singkat. */
  hint?: string
}

/** Kartu angka ringkas untuk bagian atas halaman admin. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              TONE_CLASS[tone]
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-muted-foreground">
              {label}
            </span>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {value.toLocaleString("id-ID")}
            </span>
            {hint ? (
              <span className="truncate text-xs text-muted-foreground">
                {hint}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
