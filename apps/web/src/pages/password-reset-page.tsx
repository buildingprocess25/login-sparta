import * as React from "react"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { updateUserPassword, type SpartaSession } from "@/lib/sparta-auth"

type PasswordResetPageProps = {
  session: SpartaSession
  onPasswordChanged: (session: SpartaSession) => void
  onLogout: () => void
}

function PasswordResetPage({
  session,
  onPasswordChanged,
  onLogout,
}: PasswordResetPageProps) {
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = updateUserPassword({
      email: session.email,
      newPassword: password,
    })

    if (!result.ok) {
      setError(result.message)
      toast.error("Password belum bisa diperbarui", {
        description: result.message,
      })
      return
    }

    toast.success("Password SPARTA berhasil diperbarui")
    onPasswordChanged({
      ...session,
      mustChangePassword: false,
    })
  }

  return (
    <AppShell session={session} onLogout={onLogout}>
      <div className="flex flex-1 items-center justify-center py-4 sm:py-0">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Perbarui password SPARTA</CardTitle>
            <CardDescription>
              Untuk melanjutkan, buat password baru sebelum membuka modul
              SPARTA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="new-password">Password baru</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockKeyhole />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setError(null)
                      }}
                      placeholder="Masukkan password baru"
                      autoComplete="new-password"
                      aria-invalid={Boolean(error)}
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
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>

                <Button type="submit" disabled={!password.trim()}>
                  Simpan password baru
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

export { PasswordResetPage }
