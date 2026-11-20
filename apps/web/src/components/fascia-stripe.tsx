import { cn } from "@/lib/utils"

type FasciaStripeProps = {
  className?: string
}

/** Garis tipis merah dan kuning seperti papan nama toko Alfamart. */
function FasciaStripe({ className }: FasciaStripeProps) {
  return (
    <div aria-hidden="true" className={cn("flex h-1.5 w-full", className)}>
      <div className="flex-[5] bg-fascia-red" />
      <div className="flex-[2] bg-fascia-yellow" />
    </div>
  )
}

export { FasciaStripe }
