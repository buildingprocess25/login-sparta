import * as React from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { toast } from "sonner"

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
import { loginToSparta, type SpartaSession } from "@/lib/sparta-auth"
import { ROUTES } from "@/routes"

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
      toast.error("Login SPARTA belum berhasil", {
        description: result.message,
      })
      return
    }

    onAuthenticated(result.session)
  }

  const canSubmit = Boolean(email.trim() && password.trim())

  return (
    <Card>
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
              <FieldLabel
                htmlFor="password"
                className="flex-wrap justify-between gap-1"
              >
                Password SPARTA
                <Button variant="link" size="xs" asChild>
                  <a href={ROUTES.forgotPassword}>Lupa password?</a>
                </Button>
              </FieldLabel>
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
                  placeholder="Masukkan password"
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

              {status ? <FieldError>{status.message}</FieldError> : null}
            </Field>

            <Button type="submit" disabled={!canSubmit}>
              Masuk ke SPARTA
              <ArrowRight data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-center gap-1 text-center">
        <p className="hidden text-xs text-muted-foreground sm:block">
          © 2026 PT Sumber Alfaria Trijaya, Tbk. Seluruh Hak Cipta.
        </p>
        <p className="text-xs text-muted-foreground">
          Hanya untuk penggunaan manajemen internal Departemen BME.
        </p>
      </CardFooter>
    </Card>
  )
}

export { LoginPage }
