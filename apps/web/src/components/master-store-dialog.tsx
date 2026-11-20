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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ApiClientError } from "@/lib/api-client"
import {
  createMasterStore,
  STORE_OWNERSHIP_LABEL,
  updateMasterStore,
  type MasterBranch,
  type MasterStore,
} from "@/lib/sparta-master-admin"

/** Nilai Select untuk "tidak diisi" (Select tidak menerima ""). */
const NONE = "__none__"

type MasterStoreDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = mode tambah toko baru. */
  store: MasterStore | null
  branches: MasterBranch[]
  /** Dipanggil setelah data berubah agar daftar dimuat ulang. */
  onChanged: () => void
}

function errorMessage(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : "Perubahan belum tersimpan. Coba lagi."
}

export function MasterStoreDialog({
  open,
  onOpenChange,
  store,
  branches,
  onChanged,
}: MasterStoreDialogProps) {
  const isEdit = store !== null
  // Form diisi dari props saat dialog dibuat. Pemanggil memberi `key` baru
  // setiap kali dialog dibuka, sehingga form selalu mulai dari data terbaru.
  const [code, setCode] = React.useState(store?.code ?? "")
  const [name, setName] = React.useState(store?.name ?? "")
  const [branchCode, setBranchCode] = React.useState(store?.branchCode ?? "")
  const [subArea, setSubArea] = React.useState(store?.subArea ?? "")
  const [brand, setBrand] = React.useState(store?.brand ?? "")
  const [ownershipType, setOwnershipType] = React.useState(
    store?.ownershipType ?? NONE
  )
  const [isActive, setIsActive] = React.useState(store?.isActive ?? true)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // Cabang nonaktif tetap muncul bila masih dipakai toko ini.
  const selectableBranches = branches.filter(
    (branch) => branch.isActive || branch.code === store?.branchCode
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!branchCode) {
      setFormError("Pilih cabang terlebih dahulu.")
      return
    }

    const fields = {
      name: name.trim(),
      branchCode,
      subArea: subArea.trim() || null,
      brand: brand.trim() || null,
      ownershipType: ownershipType === NONE ? null : ownershipType,
    }

    setIsSaving(true)
    try {
      if (isEdit) {
        await updateMasterStore(store.code, { ...fields, isActive })
        toast.success(`Toko ${store.code} diperbarui.`)
      } else {
        await createMasterStore({ code: code.trim(), ...fields })
        toast.success(`Toko ${code.trim().toUpperCase()} ditambahkan.`)
      }
      onChanged()
      onOpenChange(false)
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Ubah toko ${store.code}` : "Tambah toko"}
          </DialogTitle>
          <DialogDescription>
            Semua modul SPARTA membaca data toko ini lewat sync malam.
          </DialogDescription>
        </DialogHeader>

        <form id="master-store-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field>
                <FieldLabel htmlFor="store-code">Kode toko</FieldLabel>
                <Input
                  id="store-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={isEdit}
                  required
                  placeholder="T968"
                  autoComplete="off"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="store-name">Nama toko</FieldLabel>
                <Input
                  id="store-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  autoComplete="off"
                />
              </Field>
            </div>
            <FieldDescription>
              {isEdit
                ? "Kode tidak bisa diubah karena disimpan oleh modul lain."
                : "Kode toko Alfamart: huruf dan angka, 3-10 karakter. Tidak bisa diubah setelah disimpan."}
            </FieldDescription>

            <Field>
              <FieldLabel htmlFor="store-branch">Cabang</FieldLabel>
              <Select value={branchCode} onValueChange={setBranchCode}>
                <SelectTrigger id="store-branch" className="w-full">
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {selectableBranches.map((branch) => (
                    <SelectItem key={branch.code} value={branch.code}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="store-subarea">Sub-area</FieldLabel>
                <Input
                  id="store-subarea"
                  value={subArea}
                  onChange={(event) => setSubArea(event.target.value)}
                  placeholder="Opsional, mis. BEKASI"
                  autoComplete="off"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="store-brand">Brand</FieldLabel>
                <Input
                  id="store-brand"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="Opsional, mis. ALFAMART"
                  autoComplete="off"
                />
              </Field>
            </div>
            <FieldDescription>
              Sub-area adalah pembagian toko di dalam cabang, misalnya cabang
              CILEUNGSI dibagi menjadi BEKASI, BOGOR, dan KARAWANG.
            </FieldDescription>

            <Field>
              <FieldLabel htmlFor="store-ownership">Kepemilikan</FieldLabel>
              <Select value={ownershipType} onValueChange={setOwnershipType}>
                <SelectTrigger id="store-ownership" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Tidak diisi</SelectItem>
                  {Object.entries(STORE_OWNERSHIP_LABEL).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </Field>

            {isEdit ? (
              <Field orientation="horizontal">
                <Switch
                  id="store-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <FieldLabel htmlFor="store-active">
                  {isActive ? "Aktif" : "Nonaktif"}
                </FieldLabel>
              </Field>
            ) : null}

            {formError ? <FieldError>{formError}</FieldError> : null}
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
          <Button type="submit" form="master-store-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "Simpan perubahan" : "Tambah toko"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
