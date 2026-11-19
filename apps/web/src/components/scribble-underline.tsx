import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ScribbleUnderlineProps = {
  children: ReactNode
  className?: string
}

/**
 * Garis bawah coretan tangan untuk menonjolkan kata kunci di judul. Garis
 * "digambar" sekali (kelas .sketch-draw, mati untuk reduced motion).
 */
function ScribbleUnderline({ children, className }: ScribbleUnderlineProps) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-2 h-3 w-full text-primary sm:-bottom-3 sm:h-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <path
          d="M4 11C62 4 140 3 214 6c30 1 56 3 82 6"
          pathLength={1}
          strokeWidth="3.5"
          className="sketch-draw"
          style={{ ["--sketch-delay" as string]: "0.3s" }}
        />
        <path
          d="M40 14c58-5 128-6 196-3"
          pathLength={1}
          strokeWidth="2"
          opacity="0.55"
          className="sketch-draw"
          style={{ ["--sketch-delay" as string]: "0.6s" }}
        />
      </svg>
    </span>
  )
}

export { ScribbleUnderline }
