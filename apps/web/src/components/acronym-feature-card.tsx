import type { CSSProperties, ReactNode } from "react"

type AcronymPart = {
  letter: string
  word: string
  description: string
}

type AcronymFeatureCardProps = {
  parts: AcronymPart[]
  title: ReactNode
  description: string
}

/**
 * Kartu besar berisi arti akronim: judul di kiri, tiap huruf sebagai ubin
 * ikon dengan kata dan penjelasannya. Semua isi terbaca tanpa interaksi.
 * Mobile: daftar baris (ubin di kiri teks). Tablet: 2 kolom. Desktop: 3 kolom.
 */
function AcronymFeatureCard({
  parts,
  title,
  description,
}: AcronymFeatureCardProps) {
  if (parts.length === 0) return null

  return (
    <div className="overflow-hidden surface-card">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-12 xl:p-12">
        <div className="flex flex-col gap-3">
          <h2 className="section-title">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {description}
          </p>
        </div>

        <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 sm:gap-y-10 xl:grid-cols-3">
          {parts.map((part, index) => (
            <li
              key={`${part.letter}-${index}`}
              className="sketch-fade flex gap-4 sm:flex-col"
              style={{ "--sketch-delay": `${index * 0.08}s` } as CSSProperties}
            >
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-medium text-primary-foreground shadow-[0_10px_20px_-10px_var(--primary)] sm:size-14 sm:text-3xl"
              >
                {part.letter}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-heading text-lg leading-tight font-medium">
                  {part.word}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {part.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export type { AcronymPart }
export { AcronymFeatureCard }
