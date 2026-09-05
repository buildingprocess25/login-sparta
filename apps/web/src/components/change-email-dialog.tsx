import * as React from "react"
import { LockKeyhole, Mail, Info } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  InputGroupInput,
} from "@/components/ui/input-group"
import { changeEmail, type SpartaSession } from "@/lib/sparta-auth"

const MODULE_NAMES: Record<string, string> = {
  building: "SPARTA Building",
  maintenance: "SPARTA Maintenance",
  energy: "SPARTA Energy",
  engineering: "SPARTA Engineering",
}

type ChangeEmailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: SpartaSession
}

function ChangeEmailDialog({
  open,
  onOpenChange,
  session,
}: ChangeEmailDialogProps) {
  const [newEmail, setNewEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [status, setStatus] = React.useState<{ message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const resetDialogState = () => {
    setNewEmail("")
    setPassword("")
    setStatus(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetDialogState()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    
    const result = await changeEmail({ newEmail, password })
    setIsSubmitting(false)

    if (!result.ok) {
      setStatus({ message: result.message })
      return
    }

    toast.success("Email SPARTA berhasil diganti", {
      description: "Perubahan akan diterapkan secara instan."
    })
    
    handleOpenChange(false)
    window.location.reload()
  }

  const activeModulesText = React.useMemo(() => {
    if (!session.access || session.access.length === 0) return ""
    return session.access.map((mod) => MODULE_NAMES[mod] || mod).join(", ")
  }, [session.access])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti Email SPARTA</DialogTitle>
          <DialogDescription>
            Masukkan email baru dan password Anda untuk mengonfirmasi perubahan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {activeModulesText && (
              <Alert variant="default" className="bg-primary/5 text-primary border-primary/20">
                <Info className="size-4 text-primary" />
                <AlertTitle>Perhatian</AlertTitle>
                <AlertDescription className="text-primary/90">
                  Mengganti email SPARTA akan turut mengganti akun Anda di semua modul yang Anda akses ({activeModulesText}).
                </AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel>Email saat ini</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Mail /></InputGroupAddon>
                <InputGroupInput value={session.email} disabled readOnly />
              </InputGroup>
            </Field>

            <Field data-invalid={Boolean(status)}>
              <FieldLabel htmlFor="new-email">Email baru</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Mail /></InputGroupAddon>
                <InputGroupInput
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value)
                    setStatus(null)
                  }}
                  placeholder="Masukkan email baru"
                  required
                />
              </InputGroup>
            </Field>

            <Field data-invalid={Boolean(status)}>
              <FieldLabel htmlFor="confirm-password">Password saat ini</FieldLabel>
              <InputGroup>
                <InputGroupAddon><LockKeyhole /></InputGroupAddon>
                <InputGroupInput
                  id="confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setStatus(null)
                  }}
                  placeholder="Masukkan password Anda"
                  required
                />
              </InputGroup>
              {status ? <FieldError>{status.message}</FieldError> : null}
            </Field>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || !newEmail || !password}>
                {isSubmitting ? "Menyimpan..." : "Simpan Email"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ChangeEmailDialog }
