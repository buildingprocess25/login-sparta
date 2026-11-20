import * as React from "react"
import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  SPARTA_PORTAL_ROLES,
  type SpartaUserStatus,
} from "@sparta/shared"
import {
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { StatusBadge, type StatusTone } from "@/components/status-badge"
import { TablePagination } from "@/components/table-pagination"
import { UserAccessDialog } from "@/components/user-access-dialog"
import { UserFormDialog } from "@/components/user-form-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiClientError } from "@/lib/api-client"
import { SPARTA_APPS, type SpartaSession } from "@/lib/sparta-auth"
import {
  listMasterBranches,
  type MasterBranch,
} from "@/lib/sparta-master-admin"
import {
  canManageUsers,
  listAdminUsers,
  listModuleRoles,
  PORTAL_ROLE_LABEL,
  USER_STATUS_LABEL,
  type AdminUser,
  type ModuleRole,
} from "@/lib/sparta-user-admin"

type UserManagementPageProps = {
  session: SpartaSession
  onLogout: () => void
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" }

type DialogState =
  | { kind: "closed"; userId: string | null }
  | { kind: "form"; userId: string | null }
  | { kind: "access"; userId: string }

const ALL = "all"
const PAGE_SIZE = 10

const STATUS_TONE: Record<SpartaUserStatus, StatusTone> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  LOCKED: "danger",
}

const joinedFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function matchesQuery(user: AdminUser, query: string) {
  const needle = query.trim().toUpperCase()
  if (!needle) return true
  return [
    user.fullName,
    user.email,
    user.employeeId ?? "",
    user.branchCode,
    user.branchName,
  ].some((value) => value.toUpperCase().includes(needle))
}

/** Katalog role mati (provisioning nonaktif) tidak menghalangi halaman. */
async function loadModuleRolesSafely(): Promise<{
  roles: ModuleRole[]
  provisioningOff: boolean
}> {
  try {
    return { roles: await listModuleRoles(), provisioningOff: false }
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.code === "PROVISIONING_DISABLED"
    ) {
      return { roles: [], provisioningOff: true }
    }
    throw error
  }
}

export function UserManagementPage({
  session,
  onLogout,
}: UserManagementPageProps) {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [branches, setBranches] = React.useState<MasterBranch[]>([])
  const [moduleRoles, setModuleRoles] = React.useState<ModuleRole[]>([])
  const [provisioningOff, setProvisioningOff] = React.useState(false)
  const [loadState, setLoadState] = React.useState<LoadState>({
    status: "loading",
  })
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>(ALL)
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL)
  const [moduleFilter, setModuleFilter] = React.useState<string>(ALL)
  const [page, setPage] = React.useState(1)
  const [dialog, setDialog] = React.useState<DialogState>({
    kind: "closed",
    userId: null,
  })

  const canManage = canManageUsers(session)

  const load = React.useCallback(async () => {
    try {
      const [nextUsers, nextBranches, roleResult] = await Promise.all([
        listAdminUsers(),
        listMasterBranches(),
        loadModuleRolesSafely(),
      ])
      setUsers(nextUsers)
      setBranches(nextBranches)
      setModuleRoles(roleResult.roles)
      setProvisioningOff(roleResult.provisioningOff)
      setLoadState({ status: "ready" })
    } catch (error) {
      setLoadState({
        status: "error",
        message:
          error instanceof ApiClientError
            ? error.message
            : "Daftar user belum bisa dimuat.",
      })
    }
  }, [])

  React.useEffect(() => {
    if (!canManage) return
    // Muat di frame berikutnya: setState tidak dipanggil langsung di effect.
    const frame = requestAnimationFrame(() => void load())
    return () => cancelAnimationFrame(frame)
  }, [canManage, load])

  const retry = () => {
    setLoadState({ status: "loading" })
    void load()
  }

  const refresh = async () => {
    setIsRefreshing(true)
    await load()
    setIsRefreshing(false)
  }

  // Setiap perubahan saringan kembali ke halaman pertama.
  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }

  const closeDialog = () =>
    setDialog((current) => ({ kind: "closed", userId: current.userId }))

  // Dialog membaca user terbaru setelah data dimuat ulang.
  const dialogUser =
    dialog.userId === null
      ? null
      : (users.find((user) => user.id === dialog.userId) ?? null)

  const filteredUsers = users.filter(
    (user) =>
      matchesQuery(user, query) &&
      (roleFilter === ALL || user.role === roleFilter) &&
      (statusFilter === ALL || user.status === statusFilter) &&
      (moduleFilter === ALL ||
        user.modules.some((m) => m.moduleId === moduleFilter && m.isActive))
  )
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const activeCount = users.filter((u) => u.status === "ACTIVE").length
  const adminCount = users.filter((u) => u.role !== "USER").length
  const missingNikCount = users.filter((u) => !u.employeeId).length
  const hasFilter =
    query.trim() !== "" ||
    roleFilter !== ALL ||
    statusFilter !== ALL ||
    moduleFilter !== ALL

  if (!canManage) {
    return (
      <AppShell session={session} onLogout={onLogout}>
        <Alert>
          <AlertTitle>Akses ditolak</AlertTitle>
          <AlertDescription>
            Halaman Manajemen User hanya untuk admin sistem.
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  return (
    <AppShell session={session} onLogout={onLogout}>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-medium sm:text-3xl">
              Manajemen User
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Akun dibuat sekali di portal, lalu dikirim ke modul yang dipilih.
              User yang tidak dipakai lagi dinonaktifkan, bukan dihapus.
            </p>
          </div>
          <Button onClick={() => setDialog({ kind: "form", userId: null })}>
            <Plus data-icon="inline-start" />
            Tambah user
          </Button>
        </div>

        {loadState.status === "loading" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Memuat daftar user...
          </p>
        ) : null}

        {loadState.status === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>Daftar user gagal dimuat</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col items-start gap-3">
                <span>{loadState.message}</span>
                <Button variant="outline" size="sm" onClick={retry}>
                  Coba lagi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {loadState.status === "ready" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total user" value={users.length} icon={Users} />
              <StatCard
                label="User aktif"
                value={activeCount}
                icon={UserCheck}
                tone="success"
              />
              <StatCard
                label="Nonaktif atau terkunci"
                value={users.length - activeCount}
                icon={UserX}
              />
              <StatCard
                label="Admin"
                value={adminCount}
                icon={ShieldCheck}
                tone="primary"
                hint="Admin sistem dan admin data master"
              />
            </div>

            {provisioningOff ? (
              <Alert>
                <AlertTitle>Pengiriman ke modul tidak aktif</AlertTitle>
                <AlertDescription>
                  Server ini berjalan tanpa provisioning. Perubahan tersimpan di
                  portal, tetapi belum dikirim ke modul, dan pilihan role modul
                  diketik manual.
                </AlertDescription>
              </Alert>
            ) : null}

            {missingNikCount > 0 ? (
              <Alert>
                <AlertTitle>{missingNikCount} user belum punya NIK</AlertTitle>
                <AlertDescription>
                  User ini kemungkinan dibuat oleh sync modul lama. Lengkapi NIK
                  lewat menu Ubah data agar modul bisa mencocokkan karyawan.
                </AlertDescription>
              </Alert>
            ) : null}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                  <div className="w-full lg:max-w-sm">
                    <InputGroup>
                      <InputGroupAddon>
                        <Search />
                      </InputGroupAddon>
                      <InputGroupInput
                        value={query}
                        onChange={(event) =>
                          withFirstPage(setQuery)(event.target.value)
                        }
                        placeholder="Cari nama, email, NIK, atau cabang"
                        aria-label="Cari user"
                      />
                    </InputGroup>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:justify-end">
                    <Select
                      value={roleFilter}
                      onValueChange={withFirstPage(setRoleFilter)}
                    >
                      <SelectTrigger
                        className="w-full lg:w-44"
                        aria-label="Saring role portal"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>Semua role</SelectItem>
                        {SPARTA_PORTAL_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {PORTAL_ROLE_LABEL[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={withFirstPage(setStatusFilter)}
                    >
                      <SelectTrigger
                        className="w-full lg:w-40"
                        aria-label="Saring status"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>Semua status</SelectItem>
                        {(
                          Object.keys(USER_STATUS_LABEL) as SpartaUserStatus[]
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            {USER_STATUS_LABEL[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={moduleFilter}
                      onValueChange={withFirstPage(setModuleFilter)}
                    >
                      <SelectTrigger
                        className="w-full lg:w-40"
                        aria-label="Saring modul"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>Semua modul</SelectItem>
                        {SPARTA_LAUNCHABLE_MODULE_IDS.map((moduleId) => (
                          <SelectItem key={moduleId} value={moduleId}>
                            {SPARTA_APPS[moduleId].shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Muat ulang daftar user"
                    onClick={() => void refresh()}
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={isRefreshing ? "animate-spin" : undefined}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada user. Tambahkan user pertama.
                  </p>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-muted-foreground">
                      Tidak ada user yang cocok dengan pencarian atau saringan
                      ini.
                    </p>
                    {hasFilter ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery("")
                          setRoleFilter(ALL)
                          setStatusFilter(ALL)
                          setModuleFilter(ALL)
                          setPage(1)
                        }}
                      >
                        Hapus saringan
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>NIK</TableHead>
                          <TableHead>Cabang</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Modul</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bergabung</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagedUsers.map((user) => {
                          const activeModules = user.modules.filter(
                            (m) => m.isActive
                          )
                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>
                                      {initials(user.fullName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex min-w-0 flex-col">
                                    <span className="font-medium">
                                      {user.fullName}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="tabular-nums">
                                {user.employeeId ?? (
                                  <Badge variant="destructive">Belum ada</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{user.branchName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.branchCode}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.role === "USER"
                                      ? "secondary"
                                      : "default"
                                  }
                                >
                                  {PORTAL_ROLE_LABEL[user.role]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {activeModules.length > 0 ? (
                                  <div className="flex max-w-56 flex-wrap gap-1">
                                    {activeModules.map((m) => (
                                      <Badge key={m.moduleId} variant="outline">
                                        {SPARTA_APPS[m.moduleId].shortName}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  label={USER_STATUS_LABEL[user.status]}
                                  tone={STATUS_TONE[user.status]}
                                />
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                                {joinedFormat.format(new Date(user.createdAt))}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={`Aksi untuk ${user.fullName}`}
                                    >
                                      <MoreHorizontal />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        setDialog({
                                          kind: "form",
                                          userId: user.id,
                                        })
                                      }
                                    >
                                      Ubah data
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        setDialog({
                                          kind: "access",
                                          userId: user.id,
                                        })
                                      }
                                    >
                                      Akses modul dan riwayat
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    <TablePagination
                      page={currentPage}
                      pageSize={PAGE_SIZE}
                      total={filteredUsers.length}
                      onPageChange={setPage}
                      itemLabel="user"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* key berubah setiap buka/tutup agar form dimulai dari data terbaru. */}
      <UserFormDialog
        key={`form-${dialog.userId ?? "new"}-${dialog.kind === "form"}`}
        open={dialog.kind === "form"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        // Tetap diisi saat menutup agar judul tidak berkedip jadi "Tambah user".
        user={dialog.kind === "access" ? null : dialogUser}
        branches={branches}
        moduleRoles={moduleRoles}
        onChanged={() => void load()}
      />
      {dialogUser ? (
        <UserAccessDialog
          key={`access-${dialogUser.id}-${dialog.kind === "access"}`}
          open={dialog.kind === "access"}
          onOpenChange={(open) => {
            if (!open) closeDialog()
          }}
          user={dialogUser}
          moduleRoles={moduleRoles}
          onChanged={() => void load()}
        />
      ) : null}
    </AppShell>
  )
}
