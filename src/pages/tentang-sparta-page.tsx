import { ArrowLeft, CheckCircle2, Layers3, ShieldCheck } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
]

const spartaFocus = [
  {
    title: "Terintegrasi",
    icon: Layers3,
  },
  {
    title: "Terkontrol",
    icon: ShieldCheck,
  },
  {
    title: "Terlacak",
    icon: CheckCircle2,
  },
]

const developmentTeam = [...primaryDevelopmentTeam, ...otherDevelopmentTeam]

type AboutSpartaPageProps = {
  session?: SpartaSession | null
  onLogout?: () => void
}

function TeamMemberFrame({
  member,
  className,
}: {
  member: SpartaTeamMember
  className: string
}) {
  return (
    <div
      className={`relative flex overflow-hidden rounded-none bg-card ring-1 ring-foreground/10 ${className}`}
    >
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-primary/10" />
      )}
    </div>
  )
}

function TeamMemberCaption({ member }: { member: SpartaTeamMember }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-heading text-lg font-medium lg:text-xl">
        {member.name}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{member.role}</p>
    </div>
  )
}

function AboutSpartaPage({ session, onLogout }: AboutSpartaPageProps) {
  return (
    <AppShell session={session} onLogout={onLogout}>
      <div className="flex flex-col gap-8">
        {!session ? (
          <div className="sticky top-4 z-20 flex items-center">
            <Button
              className="bg-background/90 shadow-sm backdrop-blur"
              variant="outline"
              asChild
            >
              <a href={ROUTES.login}>
                <ArrowLeft data-icon="inline-start" />
                Kembali ke Login
              </a>
            </Button>
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <h1 className="font-heading text-4xl font-medium text-balance sm:text-5xl">
                Platform digital untuk menghubungkan proses kerja BME.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                SPARTA merupakan program untuk mendigitalisasi proses bisnis
                yang ada pada Building Maintenance Energy. Melalui satu platform
                digital, sistem ini terintegrasi dan dirancang untuk
                menghubungkan seluruh proses kerja.
              </p>
            </div>
          </div>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Fokus SPARTA</CardTitle>
              <CardDescription>
                Administrasi, pelaporan, pelacakan pekerjaan, dan approval dalam
                satu alur kerja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid items-center justify-items-center gap-3 sm:grid-cols-3">
                {spartaFocus.map((focus) => {
                  const Icon = focus.icon

                  return (
                    <div
                      key={focus.title}
                      className="flex items-center justify-center gap-2 text-center text-sm font-medium"
                    >
                      <Icon className="text-primary" />
                      <span>{focus.title}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="modul-sparta" className="grid gap-4 md:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.name} size="sm">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={module.logo}
                    alt=""
                    className="size-12 shrink-0 object-contain"
                  />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <CardTitle>{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <Separator />

        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-start justify-between gap-3 text-sm font-medium sm:flex-row lg:text-xl">
            <h2 className="font-heading">Development Team SPARTA</h2>
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {developmentTeam.map((member) => (
              <article
                key={member.name}
                className="flex min-w-0 flex-col gap-3"
              >
                <TeamMemberFrame member={member} className="h-72" />
                <TeamMemberCaption member={member} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export { AboutSpartaPage }
