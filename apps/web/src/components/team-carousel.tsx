import * as React from "react"
import { MoveHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { SpartaTeamMember } from "@/lib/sparta-team"
import { cn } from "@/lib/utils"

type TeamCarouselProps = {
  members: SpartaTeamMember[]
  /** Nama wilayah carousel untuk screen reader. */
  label: string
}

/** Ambil label generasi dari role, misal "Fullstack Developer (5th Gen)". */
function getGeneration(role: string) {
  return role.match(/\((\d+(?:st|nd|rd|th) Gen)\)/)?.[1] ?? null
}

/** Role tanpa label generasi (generasi sudah tampil sebagai lencana foto). */
function getRoleTitle(role: string) {
  return role.replace(/\s*\(\d+(?:st|nd|rd|th) Gen\)/, "")
}

function padIndex(value: number) {
  return String(value).padStart(2, "0")
}

/** Jarak kartu ke kartu aktif pada carousel yang berputar (loop). */
function getLoopDistance(index: number, selected: number, total: number) {
  const direct = Math.abs(index - selected)
  return Math.min(direct, total - direct)
}

/**
 * Carousel tim bergaya "lengkung": kartu aktif berwarna, sedikit terangkat,
 * dengan cahaya lembut di belakangnya; kartu lain abu-abu dan makin turun
 * serta mengecil sesuai jaraknya. Nama dan jabatan di label kaca di atas
 * foto. Bisa digeser (sentuh/mouse), tombol, panah keyboard, ketuk foto, atau
 * lompat per generasi.
 */
function TeamCarousel({ members, label }: TeamCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setSelected(api.selectedScrollSnap())
    }

    handleSelect()
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)

    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  const generations = React.useMemo(() => {
    const firstIndexByGeneration = new Map<string, number>()

    members.forEach((member, index) => {
      const generation = getGeneration(member.role)
      if (generation && !firstIndexByGeneration.has(generation)) {
        firstIndexByGeneration.set(generation, index)
      }
    })

    return Array.from(firstIndexByGeneration, ([name, index]) => ({
      name,
      index,
    }))
  }, [members])

  const activeGeneration = getGeneration(members[selected]?.role ?? "")
  const progress =
    members.length > 0 ? ((selected + 1) / members.length) * 100 : 0

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada anggota tim yang ditampilkan.
      </p>
    )
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "center", loop: true }}
      aria-label={label}
      className="flex flex-col items-center gap-8"
    >
      <div
        role="group"
        aria-label="Lompat ke generasi"
        className="flex flex-wrap justify-center gap-2"
      >
        {generations.map((generation) => {
          const isActive = generation.name === activeGeneration

          return (
            <Button
              key={generation.name}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-pressed={isActive}
              onClick={() => {
                api?.scrollTo(generation.index)
              }}
            >
              {generation.name}
            </Button>
          )
        })}
      </div>

      {/* Kartu memudar di tepi kiri/kanan agar barisan terasa berlanjut. */}
      <div className="w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <CarouselContent className="cursor-grab active:cursor-grabbing">
          {members.map((member, index) => {
            const distance = getLoopDistance(index, selected, members.length)
            const isActive = distance === 0
            const generation = getGeneration(member.role)

            return (
              <CarouselItem
                key={member.name}
                className="basis-[62%] sm:basis-[38%] md:basis-[28%] lg:basis-[21%] xl:basis-[19%]"
              >
                {/* pt/pb memberi ruang untuk efek lengkung dan cahaya. */}
                <button
                  type="button"
                  aria-label={`${member.name}, ${member.role}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => {
                    api?.scrollTo(index)
                  }}
                  className="group relative block w-full rounded-[1.75rem] pt-6 pb-14 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {/* Cahaya lembut merah hanya di belakang kartu aktif. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-4 top-12 bottom-10 rounded-[2rem] bg-primary blur-3xl transition-opacity duration-500 motion-reduce:transition-none",
                      isActive ? "opacity-20" : "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden rounded-[1.75rem] bg-muted ring-1 ring-black/5 transition-[transform,filter,opacity,box-shadow] duration-500 ease-out motion-reduce:transition-none",
                      distance === 0 &&
                        "-translate-y-2 shadow-[0_32px_64px_-32px_rgb(16_24_32/0.6)]",
                      distance === 1 &&
                        "translate-y-4 scale-[0.94] grayscale group-hover:grayscale-0",
                      distance >= 2 &&
                        "translate-y-8 scale-[0.88] opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                    )}
                  >
                    <img
                      src={member.image}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="size-full object-cover object-top"
                    />

                    {isActive && generation ? (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                        {generation}
                      </span>
                    ) : null}

                    {/* Label kaca berisi nama & jabatan di atas foto. */}
                    <span className="absolute inset-x-2 bottom-2 flex flex-col gap-0.5 rounded-2xl bg-black/45 px-3 py-2.5 text-left text-white ring-1 ring-white/15 backdrop-blur-md sm:inset-x-3 sm:bottom-3">
                      <span className="truncate text-sm leading-tight font-medium">
                        {member.name}
                      </span>
                      <span className="truncate text-xs text-white/80">
                        {getRoleTitle(member.role)}
                      </span>
                    </span>
                  </span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </div>

      <div className="flex w-full max-w-md items-center gap-4">
        <CarouselPrevious className="static size-11 shrink-0" />
        <div className="flex flex-1 flex-col items-center gap-2">
          <p
            aria-live="polite"
            className="text-sm font-medium text-muted-foreground tabular-nums"
          >
            <span className="text-foreground">{padIndex(selected + 1)}</span>
            {" / "}
            {padIndex(members.length)}
          </p>
          <div
            aria-hidden="true"
            className="h-0.5 w-full overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <CarouselNext className="static size-11 shrink-0" />
      </div>

      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MoveHorizontal aria-hidden="true" className="size-4" />
        Geser atau ketuk foto untuk melihat anggota lain
      </p>
    </Carousel>
  )
}

export { TeamCarousel }
