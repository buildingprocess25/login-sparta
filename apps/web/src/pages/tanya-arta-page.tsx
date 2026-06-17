import { Clock3, MessagesSquare, Sparkles, TicketCheck } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SpartaSession } from "@/lib/sparta-auth"

type TanyaArtaPageProps = {
  session: SpartaSession
  onLogout: () => void
}

const supportOptions = [
  {
    title: "Chatbot ARTA",
    description:
      "Asisten tanya jawab untuk panduan penggunaan modul SPARTA dan informasi proses kerja BME.",
    icon: MessagesSquare,
  },
  {
    title: "Ticket Bantuan",
    description:
      "Kanal pelaporan kendala akses, data, dan penggunaan SPARTA yang perlu ditindaklanjuti tim terkait.",
    icon: TicketCheck,
  },
]

function TanyaArtaPage({ session, onLogout }: TanyaArtaPageProps) {
  return (
    <AppShell session={session} onLogout={onLogout}>
      <section className="flex flex-1 flex-col justify-center gap-6 lg:grid lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-8">
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-5 lg:text-left">
          <Badge className="w-fit" variant="secondary">
            <Sparkles />
            Segera hadir
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-lg font-heading text-2xl font-medium text-balance sm:text-3xl md:text-5xl">
              Tanya ARTA untuk bantuan seputar SPARTA.
            </h1>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Halaman ini disiapkan sebagai pusat bantuan internal untuk chatbot
              dan ticketing kendala penggunaan SPARTA.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
          {supportOptions.map((option) => {
            const Icon = option.icon

            return (
              <Card key={option.title} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col gap-3">
                      <Icon className="text-primary" />
                      <div className="flex flex-col gap-1.5">
                        <CardTitle>{option.title}</CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" disabled>
                    <Clock3 data-icon="inline-start" />
                    Belum tersedia
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </AppShell>
  )
}

export { TanyaArtaPage }
