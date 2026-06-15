import * as React from "react"
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react"

import { Logo } from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  loginToSparta,
  SPARTA_APPS,
  type SpartaAppId,
  type SpartaSession,
} from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import { ROUTES } from "@/routes"

const appOrder: SpartaAppId[] = ["building", "maintenance", "energy"]

type LoginPageProps = {
  onAuthenticated: (session: SpartaSession) => void
}

type LoginStatus = {
  message: string
} | null

function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [status, setStatus] = React.useState<LoginStatus>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = loginToSparta({ email, password })

    if (!result.ok) {
      setStatus({ message: result.message })
      return
    }

    onAuthenticated(result.session)
  }

  const canSubmit = Boolean(email.trim() && password.trim())

  return (
    <main className="h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid h-svh w-full max-w-7xl grid-cols-1 overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-0 flex-col overflow-hidden border-b bg-muted/30 lg:border-r lg:border-b-0">
          <div className="flex min-h-0 flex-1 items-center p-5 sm:p-8 lg:p-10">
            <div className="flex w-full flex-col gap-8">
              <Logo />

              <div className="flex max-w-xl flex-col gap-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Building Maintenance Energy System
                  </Badge>
                </div>
                <div className="flex flex-col gap-6">
                  <h1 className="font-heading text-3xl font-medium tracking-normal text-balance sm:text-4xl lg:text-5xl">
                    <span className="font-medium text-primary">S</span>ystem for{" "}
                    <span className="font-medium text-primary">P</span>
                    roperty <span className="font-medium text-primary">A</span>
                    dministration,{" "}
                    <span className="font-medium text-primary">R</span>
                    eporting,{" "}
                    <span className="font-medium text-primary">T</span>racking &{" "}
                    <span className="font-medium text-primary">A</span>
                    pproval
                  </h1>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                    Digitalisasi proses bisnis departemen Building, Maintenance
                    & Energy (BME). Melalui satu platform digital, sistem ini
                    terintegrasi dan dirancang untuk menghubungkan seluruh
                    proses kerja.
                  </p>
                  <Badge className="rounded-none p-0" variant="link" asChild>
                    <a href={ROUTES.about}>
                      Tentang SPARTA
                      <ArrowRight data-icon="inline-end" />
                    </a>
                  </Badge>
                </div>
              </div>

              <div className="grid shrink-0 border-t sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {appOrder.map((appId) => {
                  const app = SPARTA_APPS[appId]

                  return (
                    <div
                      key={app.id}
                      className="flex min-w-0 flex-col items-center justify-center gap-2 border-b p-3 text-center last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0 lg:border-r-0 lg:border-b lg:last:border-b-0 xl:border-r xl:border-b-0 xl:last:border-r-0"
                    >
                      <img
                        src={SPARTA_APP_LOGOS[appId]}
                        alt=""
                        className="size-15 shrink-0 object-contain"
                      />
                      <span className="text-xs leading-tight font-medium whitespace-nowrap">
                        {app.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>Masuk ke SPARTA</CardTitle>
                <CardDescription>
                  Masukkan email dan password SPARTA untuk membuka modul yang
                  tersedia.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field data-invalid={Boolean(status)}>
                    <FieldLabel htmlFor="email">Email Anda</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Mail />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          setStatus(null)
                        }}
                        placeholder="Masukkan email"
                        autoComplete="email"
                        aria-invalid={Boolean(status)}
                      />
                    </InputGroup>
                  </Field>

                  <Field data-invalid={Boolean(status)}>
                    <FieldLabel htmlFor="password">Password SPARTA</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <LockKeyhole />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                          setStatus(null)
                        }}
                        placeholder="NAMA CABANG"
                        autoComplete="current-password"
                        aria-invalid={Boolean(status)}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showPassword
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                          size="icon-xs"
                          onClick={() => {
                            setShowPassword((current) => !current)
                          }}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="text-xs">
                      Setelah berhasil masuk dengan password awal, Anda akan
                      diminta membuat password baru untuk akun SPARTA.
                    </FieldDescription>
                    {status ? <FieldError>{status.message}</FieldError> : null}
                  </Field>

                  {status ? (
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <AlertTitle>Login SPARTA belum berhasil</AlertTitle>
                      <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button type="submit" disabled={!canSubmit}>
                    Masuk ke SPARTA
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-1">
              <p className="text-xs text-muted-foreground">
                © 2026 PT Sumber Alfaria Trijaya, Tbk. Seluruh Hak Cipta.
              </p>
              <p className="text-xs text-muted-foreground">
                Hanya untuk penggunaan manajemen internal Departemen BME.
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  )
}

export { LoginPage }
