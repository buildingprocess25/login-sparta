import * as React from "react"
import {
  ArrowRight,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  confirmChangePasswordWithOtp,
  requestChangePasswordOtp,
  type SpartaSession,
} from "@/lib/sparta-auth"

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: SpartaSession
}

type ChangePasswordStep = "request-otp" | "reset-password"

type ChangePasswordStatus = {
  message: string
} | null

function ChangePasswordDialog({
  open,
  onOpenChange,
  session,
}: ChangePasswordDialogProps) {
  const [step, setStep] = React.useState<ChangePasswordStep>("request-otp")
  const [otp, setOtp] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [status, setStatus] = React.useState<ChangePasswordStatus>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const resetDialogState = () => {
    setStep("request-otp")
    setOtp("")
    setNewPassword("")
    setShowNewPassword(false)
    setStatus(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      resetDialogState()
    }
  }

  const handleRequestOtp = async () => {
    setIsSubmitting(true)
    const result = await requestChangePasswordOtp()
    setIsSubmitting(false)

    if (!result.ok) {
      setStatus({ message: result.message })
      toast.error("OTP belum bisa dikirim", {
        description: result.message,
      })
      return
    }

    setOtp("")
    setStep("reset-password")
    setStatus(null)
    toast.success("OTP ganti password dikirim", {
      description: "Periksa email Anda untuk melanjutkan ganti password.",
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    const result = await confirmChangePasswordWithOtp({
      otp,
      newPassword,
    })
    setIsSubmitting(false)

    if (!result.ok) {
      setStatus({ message: result.message })
      toast.error("Password belum bisa diganti", {
        description: result.message,
      })
      return
    }

    toast.success("Password SPARTA berhasil diganti")
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ganti password SPARTA</DialogTitle>
          <DialogDescription>
            Kirim OTP ke email akun Anda, lalu masukkan OTP dan password baru.
          </DialogDescription>
        </DialogHeader>

        {step === "request-otp" ? (
          <FieldGroup>
            <Field data-invalid={Boolean(status)}>
              <FieldLabel>Email akun</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput value={session.email} disabled readOnly />
              </InputGroup>
              <FieldDescription>
                OTP akan dibuat untuk email akun yang sedang aktif.
              </FieldDescription>
              {status ? <FieldError>{status.message}</FieldError> : null}
            </Field>

            <DialogFooter>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                onClick={handleRequestOtp}
              >
                {isSubmitting ? "Mengirim..." : "Kirim OTP"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </DialogFooter>
          </FieldGroup>
        ) : null}

        {step === "reset-password" ? (
          <form onSubmit={handleSubmit}>
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
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={0} />
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={1} />
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="grid flex-1 grid-cols-3">
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={3} />
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={4} />
                    <InputOTPSlot className="size-auto h-9 sm:h-10" index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>
                  Kode OTP dikirim ke email dan berlaku selama 10 menit.
                </FieldDescription>
                {status ? <FieldError>{status.message}</FieldError> : null}
              </Field>

              <Field data-invalid={Boolean(status)}>
                <FieldLabel htmlFor="new-profile-password">
                  Password baru
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <LockKeyhole />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="new-profile-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value)
                      setStatus(null)
                    }}
                    placeholder="Masukkan password baru"
                    autoComplete="new-password"
                    aria-invalid={Boolean(status)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        showNewPassword
                          ? "Sembunyikan password baru"
                          : "Tampilkan password baru"
                      }
                      size="icon-xs"
                      onClick={() => {
                        setShowNewPassword((current) => !current)
                      }}
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Gunakan minimal 8 karakter untuk password baru.
                </FieldDescription>
              </Field>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={handleRequestOtp}
                  >
                    <RefreshCw data-icon="inline-start" />
                    Kirim ulang
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      otp.length !== 6 || !newPassword.trim() || isSubmitting
                    }
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    handleOpenChange(false)
                  }}
                >
                  Batal
                </Button>
              </div>
            </FieldGroup>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { ChangePasswordDialog }
