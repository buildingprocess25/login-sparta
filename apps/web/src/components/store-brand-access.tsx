import * as React from "react"
import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  type SpartaLaunchableModuleId,
} from "@sparta/shared"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiClientError } from "@/lib/api-client"
import { SPARTA_APPS } from "@/lib/sparta-auth"
import {
  listStoreBrands,
  setStoreBrandModules,
  type StoreBrand,
} from "@/lib/sparta-master-admin"

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" }

type PendingChange = {
  brand: StoreBrand
  moduleId: SpartaLaunchableModuleId
  enable: boolean
}

/** Brand tanpa aturan dikirim ke semua modul, jadi semua saklar menyala. */
function isEnabled(brand: StoreBrand, moduleId: SpartaLaunchableModuleId) {
  return !brand.hasRule || brand.moduleIds.includes(moduleId)
}

/** Ringkasan satu brand, mis. "semua modul" atau "hanya Maintenance". */
function describeAccess(brand: StoreBrand) {
  const enabled = SPARTA_LAUNCHABLE_MODULE_IDS.filter((id) =>
    isEnabled(brand, id)
  )
  if (enabled.length === SPARTA_LAUNCHABLE_MODULE_IDS.length) {
    return "semua modul"
  }
  if (enabled.length === 0) return "tidak dikirim ke modul"
  return `hanya ${enabled.map((id) => SPARTA_APPS[id].shortName).join(", ")}`
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

type StoreBrandAccessProps = {
  /** Mode baca saja: sembunyikan tombol Atur dan dialog pengubahan. */
  readOnly?: boolean
}

/**
 * Baris ringkas akses brand toko per modul (mis. LAWSON hanya Maintenance),
 * dengan dialog untuk mengubahnya. Berlaku pada sync malam modul berikutnya.
 */
export function StoreBrandAccess({ readOnly = false }: StoreBrandAccessProps) {
  const [brands, setBrands] = React.useState<StoreBrand[]>([])
  const [loadState, setLoadState] = React.useState<LoadState>({
    status: "loading",
  })
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [pending, setPending] = React.useState<PendingChange | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      setBrands(await listStoreBrands())
      setLoadState({ status: "ready" })
    } catch (error) {
      setLoadState({
        status: "error",
        message: errorMessage(error, "Aturan brand belum bisa dimuat."),
      })
    }
  }, [])

  React.useEffect(() => {
    // Muat di frame berikutnya: setState tidak dipanggil langsung di effect.
    const frame = requestAnimationFrame(() => void load())
    return () => cancelAnimationFrame(frame)
  }, [load])

  const applyChange = async () => {
    if (!pending) return
    const { brand, moduleId, enable } = pending
    const current = brand.hasRule
      ? brand.moduleIds
      : [...SPARTA_LAUNCHABLE_MODULE_IDS]
    const next = enable
      ? [...new Set([...current, moduleId])]
      : current.filter((id) => id !== moduleId)

    setIsSaving(true)
    try {
      await setStoreBrandModules(brand.code, next)
      toast.success(
        `Toko ${brand.code} ${enable ? "dibuka untuk" : "ditutup dari"} ${SPARTA_APPS[moduleId].shortName}.`
      )
      setPending(null)
      await load()
    } catch (error) {
      toast.error(errorMessage(error, "Aturan brand belum tersimpan."))
    } finally {
      setIsSaving(false)
    }
  }

  const pendingModuleName = pending
    ? SPARTA_APPS[pending.moduleId].shortName
    : ""
  const pendingCount = pending?.brand.storeCount.toLocaleString("id-ID") ?? "0"

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>Akses brand ke modul:</span>
        {loadState.status === "loading" ? <span>memuat...</span> : null}
        {loadState.status === "error" ? (
          <span className="text-destructive">{loadState.message}</span>
        ) : null}
        {loadState.status === "ready" && brands.length === 0 ? (
          <span>belum ada brand</span>
        ) : null}
        {loadState.status === "ready"
          ? brands.map((brand) => (
              <span key={brand.code}>
                <span className="font-medium text-foreground">
                  {brand.code}
                </span>{" "}
                {describeAccess(brand)}
              </span>
            ))
          : null}
        {loadState.status === "error" ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setLoadState({ status: "loading" })
              void load()
            }}
          >
            Coba lagi
          </Button>
        ) : readOnly ? null : (
          <Button
            variant="link"
            size="sm"
            disabled={loadState.status !== "ready" || brands.length === 0}
            onClick={() => setIsDialogOpen(true)}
          >
            Atur
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Akses brand ke modul</DialogTitle>
            <DialogDescription>
              Modul hanya menerima toko dari brand yang dibuka untuknya.
              Perubahan berlaku pada sync malam modul berikutnya.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Toko</TableHead>
                {SPARTA_LAUNCHABLE_MODULE_IDS.map((moduleId) => (
                  <TableHead key={moduleId} className="text-center">
                    {SPARTA_APPS[moduleId].shortName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.code}>
                  <TableCell className="font-medium">{brand.code}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {brand.storeCount.toLocaleString("id-ID")}
                  </TableCell>
                  {SPARTA_LAUNCHABLE_MODULE_IDS.map((moduleId) => (
                    <TableCell key={moduleId} className="text-center">
                      <Switch
                        size="sm"
                        checked={isEnabled(brand, moduleId)}
                        disabled={isSaving}
                        aria-label={`Toko ${brand.code} untuk ${SPARTA_APPS[moduleId].shortName}`}
                        onCheckedChange={(checked) =>
                          setPending({ brand, moduleId, enable: checked })
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.enable
                ? `Buka toko ${pending.brand.code} untuk ${pendingModuleName}?`
                : `Tutup toko ${pending?.brand.code ?? ""} dari ${pendingModuleName}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.enable
                ? `${pendingCount} toko ${pending.brand.code} akan dikirim ke ${pendingModuleName} pada sync berikutnya.`
                : `${pendingModuleName} akan menerima ${pendingCount} toko ${pending?.brand.code ?? ""} sebagai nonaktif pada sync berikutnya. Data lama di modul tidak dihapus.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant={pending?.enable ? "default" : "destructive"}
              disabled={isSaving}
              onClick={(event) => {
                // Tetap terbuka sampai simpan selesai; ditutup oleh applyChange.
                event.preventDefault()
                void applyChange()
              }}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              {pending?.enable ? "Buka akses" : "Tutup akses"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
