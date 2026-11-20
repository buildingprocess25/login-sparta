import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ModuleRole } from "@/lib/sparta-user-admin"

type ModuleRoleSelectProps = {
  id: string
  /** Role katalog untuk satu modul. Kosong = role diketik bebas. */
  roles: ModuleRole[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  "aria-label"?: string
}

/**
 * Pilihan role modul. Modul yang katalog rolenya belum diisi (Building, SIAGA)
 * menerima role apa pun di backend, jadi role diketik manual.
 */
export function ModuleRoleSelect({
  id,
  roles,
  value,
  onValueChange,
  disabled,
  "aria-label": ariaLabel,
}: ModuleRoleSelectProps) {
  if (roles.length === 0) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value.toUpperCase())}
        disabled={disabled}
        placeholder="Contoh: USER"
        aria-label={ariaLabel}
        autoComplete="off"
      />
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full" aria-label={ariaLabel}>
        <SelectValue placeholder="Pilih role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.code} value={role.code}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
