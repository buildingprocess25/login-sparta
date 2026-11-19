import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers3,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  AcronymFeatureCard,
  type AcronymPart,
} from "@/components/acronym-feature-card"
import { AppPhoneMockup } from "@/components/app-phone-mockup"
import { AppShell } from "@/components/app-shell"
import { ScribbleUnderline } from "@/components/scribble-underline"
import { ModuleExplorer } from "@/components/module-explorer"
import { TeamCarousel } from "@/components/team-carousel"
import { Button } from "@/components/ui/button"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import type { SpartaSession } from "@/lib/sparta-auth"
import {
  otherDevelopmentTeam,
  primaryDevelopmentTeam,
  type SpartaTeamMember,
} from "@/lib/sparta-team"
import { ROUTES } from "@/routes"

const modules = [
  {
    name: "SPARTA Building",
    description:
      "Membantu pengelolaan serta pengawasan proyek pembangunan secara digital mulai dari tahap perencanaan hingga proses serah terima.",
    logo: SPARTA_APP_LOGOS.building,
  },
  {
    name: "SPARTA Maintenance",
    description:
      "Membantu mengelola pemeliharaan preventif, pelaporan perbaikan toko, dan proses pertanggungjawaban keuangan operasional secara terpusat.",
    logo: SPARTA_APP_LOGOS.maintenance,
  },
  {
    name: "SPARTA Energy",
    description:
      "Membantu efisiensi konsumsi energi melalui audit peralatan elektronik serta estimasi kebutuhan pendingin ruangan dan lampu toko secara terintegrasi.",
    logo: SPARTA_APP_LOGOS.energy,
  },
  {
    name: "SPARTA SIAGA",
    description:
      "Membantu pemantauan operasional cabang dan mitigasi risiko bencana alam untuk gerai dan infrastruktur Alfamart secara terpadu.",
    logo: SPARTA_APP_LOGOS.siaga,
  },
  {
    name: "SPARTA Carbontrack",
    description:
      "Membantu pencatatan emisi gas rumah kaca Scope 1, 2, dan 3 serta pemantauan produksi PLTS di 37 DC Alfamart.",
    logo: SPARTA_APP_LOGOS.carbontrack,
  },
  {
    name: "SPARTA Engineering",
    description:
      "Membantu pelaksanaan perbaikan dan perawatan rutin peralatan teknikal dan operasional, serta pemeliharaan fisik dan kelistrikan bangunan cabang maupun Warehouse.",
    logo: SPARTA_APP_LOGOS.engineering,
  },
]

/** Fokus SPARTA; keterangan diambil dari deskripsi yang sudah ada di aplikasi. */
const spartaFocus = [
  {
    title: "Terintegrasi",
    detail: "Satu login untuk semua modul",
    icon: Layers3,
  },
  {
    title: "Terkontrol",
    detail: "Approval dalam satu alur kerja",
    icon: ShieldCheck,
  },
  {
    title: "Terlacak",
    detail: "Pekerjaan terpantau hingga serah terima",
    icon: CheckCircle2,
  },
]

/** Kartu kecil melayang di sekitar mockup ponsel. */
function FloatingFocusCard({
  title,
  detail,
  icon: Icon,
  className,
}: {
  title: string
  detail: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <li
      className={`absolute flex max-w-48 items-center gap-2.5 rounded-2xl bg-white/90 p-2.5 pr-3.5 shadow-[0_16px_40px_-20px_rgb(16_24_32/0.45)] ring-1 ring-foreground/5 backdrop-blur ${className ?? ""}`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm leading-tight font-medium">{title}</span>
        <span className="text-[11px] leading-4 text-muted-foreground">
          {detail}
        </span>
      </span>
    </li>
  )
}

/** Posisi kartu fokus: kiri atas, kanan tengah, kiri bawah dari ponsel. */
const focusCardPositions = [
  "top-[34%] left-0 sm:left-[2%]",
  "top-[56%] right-0 sm:right-[2%]",
  "bottom-[8%] left-0 sm:left-[6%]",
]

/**
 * Kepanjangan nama SPARTA. Penjelasan tiap huruf diambil dari deskripsi yang
 * sudah ada (fokus SPARTA dan deskripsi modul), bukan klaim baru.
 */
const acronym: AcronymPart[] = [
  {
    letter: "S",
    word: "System",
    description:
      "Satu platform digital yang menghubungkan seluruh modul Building, Maintenance & Energy.",
  },
  {
    letter: "P",
    word: "Property",
    description:
      "Toko, gudang, dan bangunan cabang yang dikelola Departemen BME.",
  },
  {
    letter: "A",
    word: "Administration",
    description:
      "Administrasi pekerjaan dan pertanggungjawaban operasional secara terpusat.",
  },
  {
    letter: "R",
    word: "Reporting",
    description: "Pelaporan pekerjaan dan perbaikan toko secara digital.",
  },
  {
    letter: "T",
    word: "Tracking",
    description:
      "Pelacakan pekerjaan dari tahap perencanaan hingga serah terima.",
  },
  {
    letter: "A",
    word: "Approval",
    description: "Persetujuan berjalan dalam satu alur kerja yang sama.",
  },
]

/** "Building, Maintenance & Energy System Manager" -> jabatan + unit. */
function splitBmeRole(role: string) {
  const unit = "Building, Maintenance & Energy System"
  const title = role.startsWith(unit) ? role.slice(unit.length).trim() : role

  return { title: title || role, unit: role.startsWith(unit) ? unit : null }
}

function countGenerations(members: SpartaTeamMember[]) {
  const generations = new Set(
    members
      .map((member) => member.role.match(/\((\d+)(?:st|nd|rd|th) Gen\)/)?.[1])
      .filter(Boolean)
  )

  return generations.size
}

type AboutSpartaPageProps = {
  session?: SpartaSession | null
  onLogout?: () => void
  showHeader?: boolean
}

function SectionHeading({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-primary tabular-nums">
        {index}
      </span>
      <h2 className="section-title">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  )
}

function TeamPortrait({ member }: { member: SpartaTeamMember }) {
  const { title, unit } = splitBmeRole(member.role)

  return (
    <article className="group flex min-w-0 flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-muted">
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="size-full object-cover object-top motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <h4 className="font-heading text-base leading-tight font-medium sm:text-lg">
          {member.name}
        </h4>
        {unit ? (
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
            {unit}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function TeamStats() {
  const stats = [
    { value: primaryDevelopmentTeam.length, label: "Tim BME" },
    { value: otherDevelopmentTeam.length, label: "Pengembang" },
    { value: countGenerations(otherDevelopmentTeam), label: "Generasi" },
  ]

  return (
    <dl className="grid grid-cols-3 divide-x border-y">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 py-5 pl-4 first:pl-0 sm:py-6 sm:pl-8"
        >
          <dt className="order-2 text-xs font-medium text-muted-foreground sm:text-sm">
            {stat.label}
          </dt>
          <dd className="order-1 section-title tabular-nums">
            {String(stat.value).padStart(2, "0")}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function AboutSpartaPage({
  session,
  onLogout,
  showHeader,
}: AboutSpartaPageProps) {
  return (
    <AppShell session={session} onLogout={onLogout} showHeader={showHeader}>
      <div className="relative isolate flex flex-col gap-16 pb-8 sm:gap-24">
        {/* Latar seluruh halaman, satu sistem warna:
            1. Kisi tipis seperti kertas gambar kerja (identitas Property &
               Development), memudar di tepi kiri/kanan.
            2. Sapuan lembut satu warna saja (merah Alfamart) yang bergantian
               kiri-kanan dari atas sampai bawah. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -bottom-16 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[linear-gradient(to_right,rgb(29_34_38/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(29_34_38/0.05)_1px,transparent_1px)] [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] bg-[size:56px_56px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -bottom-16 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[radial-gradient(52rem_36rem_at_82%_12rem,rgb(230_0_11/0.08),transparent_70%),radial-gradient(48rem_34rem_at_6%_32%,rgb(230_0_11/0.05),transparent_70%),radial-gradient(52rem_36rem_at_94%_58%,rgb(230_0_11/0.06),transparent_70%),radial-gradient(48rem_34rem_at_4%_86%,rgb(230_0_11/0.05),transparent_70%)]"
        />
        <section className="flex flex-col gap-8">
          {!session && !showHeader ? (
            <div>
              <Button variant="outline" size="sm" asChild>
                <a href={ROUTES.login}>
                  <ArrowLeft data-icon="inline-start" />
                  Kembali ke Login
                </a>
              </Button>
            </div>
          ) : null}

          {/* Hero pengenalan: teks di kiri, mockup aplikasi di kanan. */}
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
            <div className="flex flex-col gap-6">
              <p className="text-sm font-medium text-primary">Tentang SPARTA</p>
              <h1 className="font-heading text-4xl leading-[1.1] font-medium tracking-tight text-balance sm:text-5xl xl:text-6xl">
                Platform digital untuk menghubungkan{" "}
                <ScribbleUnderline>proses kerja BME.</ScribbleUnderline>
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                SPARTA merupakan program untuk mendigitalisasi proses bisnis
                yang ada pada Building Maintenance Energy. Melalui satu platform
                digital, sistem ini terintegrasi dan dirancang untuk
                menghubungkan seluruh proses kerja.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {!session ? (
                  <Button size="lg" asChild>
                    <a href={ROUTES.login}>
                      Masuk ke SPARTA
                      <ArrowRight data-icon="inline-end" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-md justify-center py-6">
              {/* Cincin konsentris: SPARTA sebagai pusat yang menghubungkan. */}
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 sm:size-[26rem]"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 sm:size-[36rem]"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/10 sm:size-[46rem]"
              />
              {/* Lingkaran lembut di belakang ponsel sebagai titik fokus. */}
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(230_0_11/0.16),transparent_70%)] sm:size-96"
              />
              <AppPhoneMockup
                modules={modules}
                className="relative lg:rotate-[4deg]"
              />
              <ul aria-label="Fokus SPARTA">
                {spartaFocus.map((focus, index) => (
                  <FloatingFocusCard
                    key={focus.title}
                    title={focus.title}
                    detail={focus.detail}
                    icon={focus.icon}
                    className={focusCardPositions[index]}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>

        <AcronymFeatureCard
          parts={acronym}
          title={
            <>
              Arti nama <span className="text-primary">SPARTA</span>
            </>
          }
          description="Enam kata di balik nama SPARTA, dari sistem hingga persetujuan."
        />

        <section id="modul-sparta" className="flex flex-col gap-10">
          <SectionHeading
            index="01"
            title="Modul SPARTA"
            description={`${modules.length} modul untuk kebutuhan Building, Maintenance & Energy, dari pembangunan toko hingga pemantauan energi.`}
          />

          <ModuleExplorer modules={modules} prefix="SPARTA" />
        </section>

        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-8">
            <SectionHeading
              index="02"
              title="Development Team SPARTA"
              description="Orang-orang di balik SPARTA, dari tim BME hingga pengembang lintas generasi."
            />
            <TeamStats />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Tim Building, Maintenance & Energy
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {primaryDevelopmentTeam.map((member) => (
                <TeamPortrait key={member.name} member={member} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Tim pengembang
            </h3>
            <TeamCarousel
              members={otherDevelopmentTeam}
              label="Tim pengembang SPARTA"
            />
          </div>
        </section>

        {/* Penutup hanya untuk pengunjung yang belum masuk. */}
        {!session ? (
          <section className="flex flex-col items-start gap-6 surface-card p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex flex-col gap-2">
              <h2 className="section-title">Masuk ke SPARTA</h2>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Gunakan email dan password SPARTA untuk membuka modul yang
                tersedia.
              </p>
            </div>
            <Button size="lg" asChild>
              <a href={ROUTES.login}>
                Masuk ke SPARTA
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}

export { AboutSpartaPage }
