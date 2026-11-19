import * as React from "react"
import { Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ApiClientError } from "@/lib/api-client"
import {
  createMasterArea,
  updateMasterArea,
  type MasterArea,
} from "@/lib/sparta-master-admin"

type MasterAreaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = mode tambah area baru. */
  area: MasterArea | null
  onChanged: () => void
}

export function MasterAreaDialog({
  open,
  onOpenChange,
  area,
  onChanged,
}: MasterAreaDialogProps) {
  const isEdit = area !== null
  // Diisi dari props; pemanggil memberi `key` baru setiap dialog dibuka.
  const [code, setCode] = React.useState(area?.code ?? "")
  const [name, setName] = React.useState(area?.name ?? "")
  const [isActive, setIsActive] = React.useState(area?.isActive ?? true)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      if (isEdit) {
        await updateMasterArea(area.code, { name: name.trim(), isActive })
        toast.success(`Area ${area.code} diperbarui.`)
      } else {
        await createMasterArea({ code: code.trim(), name: name.trim() })
        toast.success(`Area ${code.trim().toUpperCase()} ditambahkan.`)
      }
      onChanged()
      onOpenChange(false)
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.message
          : "Perubahan belum tersimpan. Coba lagi."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Ubah area ${area.code}` : "Tambah area"}
          </DialogTitle>
          <DialogDescription>
            Area mengelompokkan beberapa cabang.
          </DialogDescription>
        </DialogHeader>

        <form id="master-area-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="area-code">Kode area</FieldLabel>
              <Input
                id="area-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={isEdit}
                required
                placeholder="Contoh: JABAR"
                autoComplete="off"
              />
              <FieldDescription>
                {isEdit
                  ? "Kode tidak bisa diubah karena disimpan oleh modul lain."
                  : "Huruf, angka, - atau _, 2-20 karakter."}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="area-name">Nama area</FieldLabel>
              <Input
                id="area-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                placeholder="Contoh: Jawa Barat"
              />
            </Field>
            {isEdit ? (
              <Field orientation="horizontal">
                <Switch
                  id="area-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <FieldLabel htmlFor="area-active">
                  {isActive ? "Aktif" : "Nonaktif"}
                </FieldLabel>
              </Field>
            ) : null}
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" form="master-area-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "Simpan perubahan" : "Tambah area"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
