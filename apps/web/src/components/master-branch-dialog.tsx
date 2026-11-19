import * as React from "react"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ApiClientError } from "@/lib/api-client"
import {
  addMasterBranchAlias,
  createMasterBranch,
  removeMasterBranchAlias,
  updateMasterBranch,
  type MasterArea,
  type MasterBranch,
} from "@/lib/sparta-master-admin"

/** Nilai Select untuk "tidak masuk area mana pun" (Select tidak menerima ""). */
const NO_AREA = "__none__"

type MasterBranchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = mode tambah cabang baru. */
  branch: MasterBranch | null
  areas: MasterArea[]
  /** Dipanggil setelah data berubah agar daftar dimuat ulang. */
  onChanged: () => void
}

function errorMessage(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : "Perubahan belum tersimpan. Coba lagi."
}

export function MasterBranchDialog({
  open,
  onOpenChange,
  branch,
  areas,
  onChanged,
}: MasterBranchDialogProps) {
  const isEdit = branch !== null
  // Form diisi dari props saat dialog dibuat. Pemanggil memberi `key` baru
  // setiap kali dialog dibuka, sehingga form selalu mulai dari data terbaru.
  const [code, setCode] = React.useState(branch?.code ?? "")
  const [name, setName] = React.useState(branch?.name ?? "")
  const [address, setAddress] = React.useState(branch?.address ?? "")
  const [areaCode, setAreaCode] = React.useState(branch?.areaCode ?? NO_AREA)
  const [isActive, setIsActive] = React.useState(branch?.isActive ?? true)
  const [newAlias, setNewAlias] = React.useState("")
  const [formError, setFormError] = React.useState<string | null>(null)
  const [aliasError, setAliasError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isAliasBusy, setIsAliasBusy] = React.useState(false)

  const selectableAreas = areas.filter(
    (area) => area.isActive || area.code === branch?.areaCode
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSaving(true)

    const fields = {
      name: name.trim(),
      address: address.trim() || null,
      areaCode: areaCode === NO_AREA ? null : areaCode,
    }

    try {
      if (isEdit) {
        await updateMasterBranch(branch.code, { ...fields, isActive })
        toast.success(`Cabang ${branch.code} diperbarui.`)
      } else {
        await createMasterBranch({ code: code.trim(), ...fields })
        toast.success(`Cabang ${code.trim().toUpperCase()} ditambahkan.`)
      }
      onChanged()
      onOpenChange(false)
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddAlias = async () => {
    if (!branch || !newAlias.trim()) return
    setAliasError(null)
    setIsAliasBusy(true)
    try {
      await addMasterBranchAlias(branch.code, newAlias)
      setNewAlias("")
      onChanged()
    } catch (error) {
      setAliasError(errorMessage(error))
    } finally {
      setIsAliasBusy(false)
    }
  }

  const handleRemoveAlias = async (aliasId: string) => {
    if (!branch) return
    setAliasError(null)
    setIsAliasBusy(true)
    try {
      await removeMasterBranchAlias(branch.code, aliasId)
      onChanged()
    } catch (error) {
      setAliasError(errorMessage(error))
    } finally {
      setIsAliasBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Ubah cabang ${branch.code}` : "Tambah cabang"}
          </DialogTitle>
          <DialogDescription>
            Semua modul SPARTA membaca data ini lewat sync malam.
          </DialogDescription>
        </DialogHeader>

        <form id="master-branch-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="branch-code">Kode cabang</FieldLabel>
              <Input
                id="branch-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={isEdit}
                required
                placeholder="Contoh: BDG"
                autoComplete="off"
              />
              <FieldDescription>
                {isEdit
                  ? "Kode tidak bisa diubah karena disimpan oleh modul lain."
                  : "Huruf, angka, - atau _, 2-20 karakter. Tidak bisa diubah setelah disimpan."}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="branch-name">Nama cabang</FieldLabel>
              <Input
                id="branch-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                placeholder="Contoh: Bandung"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="branch-address">Alamat</FieldLabel>
              <Textarea
                id="branch-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Opsional"
                rows={2}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="branch-area">Area</FieldLabel>
              <Select value={areaCode} onValueChange={setAreaCode}>
                <SelectTrigger id="branch-area" className="w-full">
                  <SelectValue placeholder="Pilih area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_AREA}>Tanpa area</SelectItem>
                  {selectableAreas.map((area) => (
                    <SelectItem key={area.code} value={area.code}>
                      {area.name} ({area.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {isEdit ? (
              <Field orientation="horizontal">
                <Switch
                  id="branch-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <FieldLabel htmlFor="branch-active">
                  {isActive ? "Aktif" : "Nonaktif"}
                </FieldLabel>
              </Field>
            ) : null}

            {formError ? <FieldError>{formError}</FieldError> : null}
          </FieldGroup>
        </form>

        {isEdit ? (
          <FieldGroup>
            <FieldSeparator />
            <Field>
              <FieldLabel htmlFor="branch-alias">Alias</FieldLabel>
              <FieldDescription>
                Nama atau kode lama yang dikirim modul (misalnya "HEAD OFFICE").
                Sync user dengan alias ini otomatis masuk ke cabang{" "}
                {branch.code}.
              </FieldDescription>
              {branch.aliases.length > 0 ? (
                <ul aria-label="Daftar alias" className="flex flex-wrap gap-2">
                  {branch.aliases.map((alias) => (
                    <li key={alias.id}>
                      <Badge variant="outline">
                        {alias.alias}
                        <button
                          type="button"
                          aria-label={`Hapus alias ${alias.alias}`}
                          disabled={isAliasBusy}
                          onClick={() => void handleRemoveAlias(alias.id)}
                          className="rounded-full outline-none hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
                        >
                          <X />
                        </button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada alias.
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  id="branch-alias"
                  value={newAlias}
                  onChange={(event) => setNewAlias(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void handleAddAlias()
                    }
                  }}
                  placeholder="Tulis alias lalu tekan Tambah"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAliasBusy || !newAlias.trim()}
                  onClick={() => void handleAddAlias()}
                >
                  Tambah
                </Button>
              </div>
              {aliasError ? <FieldError>{aliasError}</FieldError> : null}
            </Field>
          </FieldGroup>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" form="master-branch-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "Simpan perubahan" : "Tambah cabang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
