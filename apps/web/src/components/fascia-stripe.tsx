import { cn } from "@/lib/utils"

type FasciaStripeProps = {
  className?: string
}

/** Garis tipis merah, kuning, biru seperti papan nama toko Alfamart. */
function FasciaStripe({ className }: FasciaStripeProps) {
  return (
    <div aria-hidden="true" className={cn("flex h-1.5 w-full", className)}>
      <div className="flex-[6] bg-fascia-red" />
      <div className="flex-[1] bg-fascia-yellow" />
      <div className="flex-[1.5] bg-fascia-blue" />
    </div>
  )
}

export { FasciaStripe }
