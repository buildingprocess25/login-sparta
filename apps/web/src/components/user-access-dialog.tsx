import * as React from "react"
import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  type ProvisioningEventStatus,
  type SpartaLaunchableModuleId,
  type SpartaProvisioningEventType,
} from "@sparta/shared"
import { Loader2, RotateCw } from "lucide-react"
import { toast } from "sonner"

import { ModuleRoleSelect } from "@/components/module-role-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiClientError } from "@/lib/api-client"
import { SPARTA_APPS } from "@/lib/sparta-auth"
import {
  grantModuleAccess,
  listProvisioningEvents,
  retryProvisioningEvent,
  revokeModuleAccess,
  roleLabel,
  rolesForModule,
  type AdminUser,
  type ModuleRole,
  type ProvisioningEvent,
} from "@/lib/sparta-user-admin"

type UserAccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser
  moduleRoles: ModuleRole[]
  /** Dipanggil setelah akses berubah agar daftar user dimuat ulang. */
  onChanged: () => void
}

const EVENT_LABEL: Record<SpartaProvisioningEventType, string> = {
  "access.granted": "Akses diberikan",
  "access.revoked": "Akses dicabut",
  "user.updated": "Data diubah",
  "user.deactivated": "User dinonaktifkan",
}

const EVENT_STATUS: Record<
  ProvisioningEventStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Menunggu", variant: "outline" },
  DELIVERED: { label: "Terkirim", variant: "secondary" },
  FAILED: { label: "Gagal", variant: "destructive" },
  SKIPPED: { label: "Tidak dikirim", variant: "outline" },
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

type EventsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; events: ProvisioningEvent[] }

export function UserAccessDialog({
  open,
  onOpenChange,
  user,
  moduleRoles,
  onChanged,
}: UserAccessDialogProps) {
  const [roleDraft, setRoleDraft] = React.useState<
    Record<SpartaLaunchableModuleId, string>
  >(() => {
    const draft = {} as Record<SpartaLaunchableModuleId, string>
    for (const moduleId of SPARTA_LAUNCHABLE_MODULE_IDS) {
      const access = user.modules.find((m) => m.moduleId === moduleId)
      draft[moduleId] =
        access?.role ?? rolesForModule(moduleRoles, moduleId)[0]?.code ?? "USER"
    }
    return draft
  })
  const [busyModule, setBusyModule] =
    React.useState<SpartaLaunchableModuleId | null>(null)
  const [revokeTarget, setRevokeTarget] =
    React.useState<SpartaLaunchableModuleId | null>(null)
  const [events, setEvents] = React.useState<EventsState>({
    status: "loading",
  })
  const [retryingId, setRetryingId] = React.useState<string | null>(null)

  const loadEvents = React.useCallback(async () => {
    try {
      const next = await listProvisioningEvents(user.id)
      setEvents({ status: "ready", events: next })
    } catch (error) {
      setEvents({
        status: "error",
        message: errorMessage(error, "Riwayat pengiriman belum bisa dimuat."),
      })
    }
  }, [user.id])

  React.useEffect(() => {
    if (!open) return
    // Muat di frame berikutnya: setState tidak dipanggil langsung di effect.
    const frame = requestAnimationFrame(() => void loadEvents())
    return () => cancelAnimationFrame(frame)
  }, [open, loadEvents])

  const reloadEvents = () => {
    setEvents({ status: "loading" })
    void loadEvents()
  }

  const handleGrant = async (moduleId: SpartaLaunchableModuleId) => {
    const role = roleDraft[moduleId].trim()
    const name = SPARTA_APPS[moduleId].shortName
    if (!role) {
      toast.error(`Isi role ${name} terlebih dahulu.`)
      return
    }
    setBusyModule(moduleId)
    try {
      await grantModuleAccess(user.id, { moduleId, role })
      toast.success(
        `Akses ${name} disimpan dengan role ${roleLabel(moduleRoles, moduleId, role)}.`
      )
      onChanged()
      reloadEvents()
    } catch (error) {
      toast.error(errorMessage(error, `Akses ${name} belum tersimpan.`))
    } finally {
      setBusyModule(null)
    }
  }

  const handleRevoke = async (moduleId: SpartaLaunchableModuleId) => {
    const name = SPARTA_APPS[moduleId].shortName
    setRevokeTarget(null)
    setBusyModule(moduleId)
    try {
      await revokeModuleAccess(user.id, moduleId)
      toast.success(`Akses ${name} dicabut.`)
      onChanged()
      reloadEvents()
    } catch (error) {
      toast.error(errorMessage(error, `Akses ${name} belum dicabut.`))
    } finally {
      setBusyModule(null)
    }
  }

  const handleRetry = async (eventId: string) => {
    setRetryingId(eventId)
    try {
      await retryProvisioningEvent(eventId)
      toast.success("Event dijadwalkan untuk dikirim ulang.")
      reloadEvents()
    } catch (error) {
      toast.error(errorMessage(error, "Event belum bisa dikirim ulang."))
    } finally {
      setRetryingId(null)
    }
  }

  const failedCount =
    events.status === "ready"
      ? events.events.filter((event) => event.status === "FAILED").length
      : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Akses {user.fullName}</DialogTitle>
          <DialogDescription>
            Setiap perubahan dikirim ke modul terkait. Riwayat pengiriman
            menunjukkan apakah modul sudah menerimanya.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="access" className="min-w-0">
          <TabsList>
            <TabsTrigger value="access">Akses modul</TabsTrigger>
            <TabsTrigger value="history">
              Riwayat pengiriman
              {failedCount > 0 ? ` (${failedCount} gagal)` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-44">Role</TableHead>
                  <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SPARTA_LAUNCHABLE_MODULE_IDS.map((moduleId) => {
                  const access = user.modules.find(
                    (m) => m.moduleId === moduleId && m.isActive
                  )
                  const name = SPARTA_APPS[moduleId].shortName
                  const isBusy = busyModule === moduleId
                  const roleUnchanged = access?.role === roleDraft[moduleId]
                  return (
                    <TableRow key={moduleId}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        {access ? (
                          <Badge variant="secondary">
                            {roleLabel(moduleRoles, moduleId, access.role)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            Tidak ada akses
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ModuleRoleSelect
                          id={`access-${moduleId}-role`}
                          aria-label={`Role ${name}`}
                          roles={rolesForModule(moduleRoles, moduleId)}
                          value={roleDraft[moduleId]}
                          onValueChange={(value) =>
                            setRoleDraft((current) => ({
                              ...current,
                              [moduleId]: value,
                            }))
                          }
                          disabled={isBusy}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={access ? "outline" : "default"}
                            disabled={isBusy || roleUnchanged}
                            onClick={() => void handleGrant(moduleId)}
                          >
                            {isBusy ? (
                              <Loader2 className="animate-spin" />
                            ) : null}
                            {access ? "Ganti role" : "Beri akses"}
                          </Button>
                          {access ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() => setRevokeTarget(moduleId)}
                            >
                              Cabut
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="history">
            {events.status === "loading" ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Memuat riwayat pengiriman...
              </p>
            ) : null}

            {events.status === "error" ? (
              <Alert variant="destructive">
                <AlertTitle>Riwayat gagal dimuat</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col items-start gap-3">
                    <span>{events.message}</span>
                    <Button variant="outline" size="sm" onClick={reloadEvents}>
                      Coba lagi
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}

            {events.status === "ready" && events.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada perubahan yang dikirim ke modul untuk user ini.
              </p>
            ) : null}

            {events.status === "ready" && events.events.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Modul</TableHead>
                    <TableHead>Perubahan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.events.map((event) => {
                    const status = EVENT_STATUS[event.status]
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                          {dateFormat.format(new Date(event.createdAt))}
                        </TableCell>
                        <TableCell>
                          {SPARTA_APPS[event.moduleId]?.shortName ??
                            event.moduleId}
                        </TableCell>
                        <TableCell>{EVENT_LABEL[event.type]}</TableCell>
                        <TableCell>
                          <div className="flex max-w-64 flex-col items-start gap-1">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                            {event.status === "SKIPPED" ? (
                              <span className="text-xs text-muted-foreground">
                                Modul belum punya URL provisioning.
                              </span>
                            ) : null}
                            {event.lastError && event.status !== "DELIVERED" ? (
                              <span className="text-xs break-words whitespace-normal text-muted-foreground">
                                Percobaan ke-{event.attempts}: {event.lastError}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {event.status === "FAILED" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={retryingId === event.id}
                              onClick={() => void handleRetry(event.id)}
                            >
                              {retryingId === event.id ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <RotateCw data-icon="inline-start" />
                              )}
                              Kirim ulang
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : null}
          </TabsContent>
        </Tabs>

        <AlertDialog
          open={revokeTarget !== null}
          onOpenChange={(next) => {
            if (!next) setRevokeTarget(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cabut akses{" "}
                {revokeTarget ? SPARTA_APPS[revokeTarget].shortName : ""}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user.fullName} tidak bisa membuka modul ini lagi, dan modul
                mengakhiri sesi yang sedang berjalan. Akses bisa diberikan
                kembali kapan saja.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (revokeTarget) void handleRevoke(revokeTarget)
                }}
              >
                Cabut akses
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
