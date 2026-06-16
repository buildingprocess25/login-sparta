import * as React from "react"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"

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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from "@/lib/sparta-auth"
import { ROUTES } from "@/routes"

type ResetStep = "email" | "otp" | "password"

type ForgotPasswordPageProps = {
  onPasswordReset: () => void
}

type ResetStatus = {
  message: string
} | null

function ForgotPasswordPage({ onPasswordReset }: ForgotPasswordPageProps) {
  const [step, setStep] = React.useState<ResetStep>("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [status, setStatus] = React.useState<ResetStatus>(null)

  const handleRequestOtp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = requestPasswordResetOtp(email)

    if (!result.ok) {
      setStatus({ message: result.message })
      toast.error("OTP belum bisa dikirim", {
        description: result.message,
      })
      return
    }

    setEmail(result.email)
    setOtp("")
    setDemoOtp(result.otp)
    setStep("otp")
    setStatus(null)
    toast.success("OTP reset password dibuat", {
      description: `Kode OTP demo: ${result.otp}`,
    })
  }

  const handleVerifyOtp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = verifyPasswordResetOtp({
      email,
      otp,
    })

    if (!result.ok) {
      setStatus({ message: result.message })
      toast.error("OTP tidak sesuai", {
        description: result.message,
      })
      return
    }

    setStep("password")
    setStatus(null)
    toast.success("OTP berhasil diverifikasi")
  }

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = resetPasswordWithOtp({
      email,
      otp,
      newPassword: password,
    })

    if (!result.ok) {
      setStatus({ message: result.message })
      toast.error("Password belum bisa diperbarui", {
        description: result.message,
      })
      return
    }

    toast.success("Password SPARTA berhasil diperbarui")
    onPasswordReset()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>Lupa password SPARTA</CardTitle>
          <CardDescription>
            Masukkan email, verifikasi OTP, lalu buat password baru.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {step === "email" ? (
            <form onSubmit={handleRequestOtp}>
              <FieldGroup>
                <Field data-invalid={Boolean(status)}>
                  <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="reset-email"
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
                  {status ? <FieldError>{status.message}</FieldError> : null}
                </Field>

                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={!email.trim()}>
                    Kirim OTP
                  </Button>
                  <Button variant="secondary" asChild>
                    <a href={ROUTES.login}>
                      <ArrowLeft data-icon="inline-start" />
                      Kembali ke Login
                    </a>
                  </Button>
                </div>
              </FieldGroup>
            </form>
          ) : null}

          {step === "otp" ? (
            <form onSubmit={handleVerifyOtp}>
              <FieldGroup>
                <Field data-invalid={Boolean(status)}>
                  <FieldLabel>Kode OTP</FieldLabel>
                  <InputOTP
                    containerClassName="w-full"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value)
                      setStatus(null)
                    }}
                    aria-invalid={Boolean(status)}
                  >
                    <InputOTPGroup className="grid flex-1 grid-cols-3">
                      <InputOTPSlot className="size-auto h-10" index={0} />
                      <InputOTPSlot className="size-auto h-10" index={1} />
                      <InputOTPSlot className="size-auto h-10" index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="grid flex-1 grid-cols-3">
                      <InputOTPSlot className="size-auto h-10" index={3} />
                      <InputOTPSlot className="size-auto h-10" index={4} />
                      <InputOTPSlot className="size-auto h-10" index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription>
                    {demoOtp
                      ? `Kode OTP demo: ${demoOtp}. Berlaku selama 10 menit.`
                      : "Kode OTP berlaku selama 10 menit."}
                  </FieldDescription>
                  {status ? <FieldError>{status.message}</FieldError> : null}
                </Field>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const result = requestPasswordResetOtp(email)

                        if (!result.ok) {
                          setStatus({ message: result.message })
                          toast.error("OTP belum bisa dikirim ulang", {
                            description: result.message,
                          })
                          return
                        }

                        setOtp("")
                        setDemoOtp(result.otp)
                        setStatus(null)
                        toast.success("OTP baru dibuat", {
                          description: `Kode OTP demo: ${result.otp}`,
                        })
                      }}
                    >
                      <RefreshCw data-icon="inline-start" />
                      Kirim ulang
                    </Button>
                    <Button type="submit" disabled={otp.length !== 6}>
                      Verifikasi OTP
                    </Button>
                  </div>
                  <Button variant="secondary" asChild>
                    <a href={ROUTES.login}>
                      <ArrowLeft data-icon="inline-start" />
                      Batal
                    </a>
                  </Button>
                </div>
              </FieldGroup>
            </form>
          ) : null}

          {step === "password" ? (
            <form onSubmit={handleResetPassword}>
              <FieldGroup>
                <Field data-invalid={Boolean(status)}>
                  <FieldLabel htmlFor="reset-password">
                    Password baru
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <LockKeyhole />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setStatus(null)
                      }}
                      placeholder="Masukkan password baru"
                      autoComplete="new-password"
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
                  <FieldDescription>
                    Gunakan minimal 8 karakter untuk password baru.
                  </FieldDescription>
                  {status ? <FieldError>{status.message}</FieldError> : null}
                </Field>

                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={!password.trim()}>
                    Simpan password baru
                  </Button>
                  <Button variant="secondary" asChild>
                    <a href={ROUTES.login}>
                      <ArrowLeft data-icon="inline-start" />
                      Batal
                    </a>
                  </Button>
                </div>
              </FieldGroup>
            </form>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export { ForgotPasswordPage }
