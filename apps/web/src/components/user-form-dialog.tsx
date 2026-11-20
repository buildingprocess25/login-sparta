import * as React from "react"
import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  SPARTA_PORTAL_ROLES,
  type SpartaLaunchableModuleId,
  type SpartaPortalRole,
  type SpartaUserStatus,
} from "@sparta/shared"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { ModuleRoleSelect } from "@/components/module-role-select"
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
  FieldLegend,
  FieldSeparator,
  FieldSet,
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
import { SPARTA_APPS } from "@/lib/sparta-auth"
import type { MasterBranch } from "@/lib/sparta-master-admin"
import {
  createAdminUser,
  PORTAL_ROLE_LABEL,
  rolesForModule,
  updateAdminUser,
  USER_STATUS_LABEL,
  type AdminUser,
  type ModuleRole,
} from "@/lib/sparta-user-admin"

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = mode tambah user baru. */
  user: AdminUser | null
  branches: MasterBranch[]
  moduleRoles: ModuleRole[]
  /** Dipanggil setelah data berubah agar daftar dimuat ulang. */
  onChanged: () => void
}

type ModuleDraft = Record<
  SpartaLaunchableModuleId,
  { enabled: boolean; role: string }
>

const STATUSES: SpartaUserStatus[] = ["ACTIVE", "INACTIVE", "LOCKED"]

function defaultRole(roles: ModuleRole[], moduleId: SpartaLaunchableModuleId) {
  return rolesForModule(roles, moduleId)[0]?.code ?? "USER"
}

function errorMessage(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : "Perubahan belum tersimpan. Coba lagi."
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  branches,
  moduleRoles,
  onChanged,
}: UserFormDialogProps) {
  const isEdit = user !== null
  // Form diisi dari props saat dialog dibuat. Pemanggil memberi `key` baru
  // setiap kali dialog dibuka, sehingga form selalu mulai dari data terbaru.
  const [fullName, setFullName] = React.useState(user?.fullName ?? "")
  const [employeeId, setEmployeeId] = React.useState(user?.employeeId ?? "")
  const [email, setEmail] = React.useState(user?.email ?? "")
  const [branchCode, setBranchCode] = React.useState(user?.branchCode ?? "")
  const [role, setRole] = React.useState<SpartaPortalRole>(user?.role ?? "USER")
  const [status, setStatus] = React.useState<SpartaUserStatus>(
    user?.status ?? "ACTIVE"
  )
  const [modules, setModules] = React.useState<ModuleDraft>(() => {
    const draft = {} as ModuleDraft
    for (const moduleId of SPARTA_LAUNCHABLE_MODULE_IDS) {
      draft[moduleId] = {
        enabled: false,
        role: defaultRole(moduleRoles, moduleId),
      }
    }
    return draft
  })
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // Cabang nonaktif tetap muncul bila masih dipakai user ini.
  const selectableBranches = branches.filter(
    (branch) => branch.isActive || branch.code === user?.branchCode
  )
  const selectedBranch = branches.find((branch) => branch.code === branchCode)
  const willDeactivate =
    isEdit && user.status === "ACTIVE" && status !== "ACTIVE"

  const setModule = (
    moduleId: SpartaLaunchableModuleId,
    patch: Partial<ModuleDraft[SpartaLaunchableModuleId]>
  ) =>
    setModules((current) => ({
      ...current,
      [moduleId]: { ...current[moduleId], ...patch },
    }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!selectedBranch) {
      setFormError("Pilih cabang terlebih dahulu.")
      return
    }
    const chosenModules = SPARTA_LAUNCHABLE_MODULE_IDS.filter(
      (moduleId) => modules[moduleId].enabled
    ).map((moduleId) => ({
      moduleId,
      role: modules[moduleId].role.trim(),
    }))
    if (chosenModules.some((module) => !module.role)) {
      setFormError("Setiap modul yang dipilih wajib punya role.")
      return
    }

    const profile = {
      fullName: fullName.trim(),
      employeeId: employeeId.trim(),
      email: email.trim(),
      branchCode: selectedBranch.code,
      branchName: selectedBranch.name,
      role,
    }

    setIsSaving(true)
    try {
      if (isEdit) {
        await updateAdminUser(user.id, { ...profile, status })
        toast.success(`Data ${profile.fullName} diperbarui.`)
      } else {
        await createAdminUser({ ...profile, modules: chosenModules })
        toast.success(
          chosenModules.length > 0
            ? `${profile.fullName} dibuat dan dikirim ke ${chosenModules.length} modul.`
            : `${profile.fullName} dibuat tanpa akses modul.`
        )
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
            {isEdit ? `Ubah data ${user.fullName}` : "Tambah user"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perubahan nama, NIK, email, cabang, atau status dikirim ke semua modul yang dipakai user ini."
              : "Akun dibuat di portal, lalu dikirim ke modul yang dipilih. Password awal mengikuti nama cabang sampai user menggantinya."}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="user-name">Nama lengkap</FieldLabel>
              <Input
                id="user-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                autoComplete="off"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="user-nik">NIK</FieldLabel>
                <Input
                  id="user-nik"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  required
                  inputMode="numeric"
                  autoComplete="off"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-role">Role portal</FieldLabel>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as SpartaPortalRole)}
                >
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPARTA_PORTAL_ROLES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PORTAL_ROLE_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-branch">Cabang</FieldLabel>
              <Select value={branchCode} onValueChange={setBranchCode}>
                <SelectTrigger id="user-branch" className="w-full">
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
              {selectableBranches.length === 0 ? (
                <FieldDescription>
                  Belum ada cabang aktif. Tambahkan cabang di halaman Data
                  Master.
                </FieldDescription>
              ) : null}
            </Field>

            {isEdit ? (
              <Field>
                <FieldLabel htmlFor="user-status">Status</FieldLabel>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as SpartaUserStatus)
                  }
                >
                  <SelectTrigger id="user-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {USER_STATUS_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {willDeactivate ? (
                  <FieldDescription>
                    User tidak bisa login ke portal, dan modul menonaktifkan
                    akun serta mengakhiri sesinya.
                  </FieldDescription>
                ) : null}
              </Field>
            ) : (
              <>
                <FieldSeparator />
                <FieldSet>
                  <FieldLegend variant="label">Akses modul</FieldLegend>
                  <FieldDescription>
                    Bisa diatur nanti lewat tombol Akses di daftar user.
                  </FieldDescription>
                  <FieldGroup>
                    {SPARTA_LAUNCHABLE_MODULE_IDS.map((moduleId) => {
                      const draft = modules[moduleId]
                      const switchId = `user-module-${moduleId}`
                      return (
                        <div
                          key={moduleId}
                          className="grid items-center gap-3 sm:grid-cols-[1fr_12rem]"
                        >
                          <Field orientation="horizontal">
                            <Switch
                              id={switchId}
                              checked={draft.enabled}
                              onCheckedChange={(enabled) =>
                                setModule(moduleId, { enabled })
                              }
                            />
                            <FieldLabel htmlFor={switchId}>
                              {SPARTA_APPS[moduleId].shortName}
                            </FieldLabel>
                          </Field>
                          {draft.enabled ? (
                            <ModuleRoleSelect
                              id={`${switchId}-role`}
                              aria-label={`Role ${SPARTA_APPS[moduleId].shortName}`}
                              roles={rolesForModule(moduleRoles, moduleId)}
                              value={draft.role}
                              onValueChange={(value) =>
                                setModule(moduleId, { role: value })
                              }
                            />
                          ) : null}
                        </div>
                      )
                    })}
                  </FieldGroup>
                </FieldSet>
              </>
            )}

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
          <Button type="submit" form="user-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "Simpan perubahan" : "Buat user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
