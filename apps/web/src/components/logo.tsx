import { cn } from "@/lib/utils"
import alfamartEmblem from "@/assets/Alfamart-Emblem-small.png"
import spartaBuildingLogo from "@/assets/Building-Logo.png"

type LogoProps = {
  className?: string
}

function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-4", className)}>
      <img
        src={alfamartEmblem}
        alt="Alfamart"
        className="h-8 w-auto object-contain drop-shadow-sm md:h-10"
      />

      <div className="h-7 w-px rounded-full bg-border md:h-8" />

      <div className="flex items-center gap-3">
        <img
          src={spartaBuildingLogo}
          alt="SPARTA Logo"
          className="h-8 w-auto object-contain drop-shadow-sm md:h-10"
        />
        <div className="flex flex-col leading-none text-foreground">
          <span className="text-base font-bold tracking-wider md:text-lg">
            SPARTA
          </span>
        </div>
      </div>
    </div>
  )
}

export { Logo }
