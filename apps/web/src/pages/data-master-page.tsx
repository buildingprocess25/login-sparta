import * as React from "react"
import {
  Building2,
  CircleOff,
  Download,
  Loader2,
  Map as MapIcon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/app-shell"
import { MasterAreaDialog } from "@/components/master-area-dialog"
import { MasterBranchDialog } from "@/components/master-branch-dialog"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { TablePagination } from "@/components/table-pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiClientError } from "@/lib/api-client"
import { downloadCsv } from "@/lib/csv"
import type { SpartaSession } from "@/lib/sparta-auth"
import {
  canManageMasterData,
  isNonStandardCode,
  listMasterAreas,
  listMasterBranches,
  updateMasterArea,
  updateMasterBranch,
  type MasterArea,
  type MasterBranch,
} from "@/lib/sparta-master-admin"

type DataMasterPageProps = {
  session: SpartaSession
  onLogout: () => void
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" }

type BranchFilter = "all" | "active" | "inactive" | "nonstandard"

const PAGE_SIZE = 10

function matchesQuery(branch: MasterBranch, query: string) {
  const needle = query.trim().toUpperCase()
  if (!needle) return true
  return [
    branch.code,
    branch.name,
    branch.areaName ?? "",
    ...branch.aliases.map((a) => a.alias),
  ].some((value) => value.toUpperCase().includes(needle))
}

function matchesFilter(branch: MasterBranch, filter: BranchFilter) {
  if (filter === "active") return branch.isActive
  if (filter === "inactive") return !branch.isActive
  if (filter === "nonstandard") return isNonStandardCode(branch)
  return true
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge
      label={isActive ? "Aktif" : "Nonaktif"}
      tone={isActive ? "success" : "neutral"}
    />
  )
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

export function DataMasterPage({ session, onLogout }: DataMasterPageProps) {
  const [branches, setBranches] = React.useState<MasterBranch[]>([])
  const [areas, setAreas] = React.useState<MasterArea[]>([])
  const [loadState, setLoadState] = React.useState<LoadState>({
    status: "loading",
  })
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<BranchFilter>("all")
  const [branchPage, setBranchPage] = React.useState(1)
  const [areaPage, setAreaPage] = React.useState(1)
  const [branchDialog, setBranchDialog] = React.useState<{
    open: boolean
    code: string | null
  }>({ open: false, code: null })
  const [areaDialog, setAreaDialog] = React.useState<{
    open: boolean
    area: MasterArea | null
  }>({ open: false, area: null })

  const canManage = canManageMasterData(session)

  const load = React.useCallback(async () => {
    try {
      const [nextBranches, nextAreas] = await Promise.all([
        listMasterBranches(),
        listMasterAreas(),
      ])
      setBranches(nextBranches)
      setAreas(nextAreas)
      setLoadState({ status: "ready" })
    } catch (error) {
      setLoadState({
        status: "error",
        message: errorMessage(error, "Data master belum bisa dimuat."),
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

  const toggleBranch = async (branch: MasterBranch) => {
    try {
      await updateMasterBranch(branch.code, { isActive: !branch.isActive })
      toast.success(
        `Cabang ${branch.code} ${branch.isActive ? "dinonaktifkan" : "diaktifkan"}.`
      )
      void load()
    } catch (error) {
      toast.error(errorMessage(error, "Status cabang belum berubah."))
    }
  }

  const toggleArea = async (area: MasterArea) => {
    try {
      await updateMasterArea(area.code, { isActive: !area.isActive })
      toast.success(
        `Area ${area.code} ${area.isActive ? "dinonaktifkan" : "diaktifkan"}.`
      )
      void load()
    } catch (error) {
      toast.error(errorMessage(error, "Status area belum berubah."))
    }
  }

  // Dialog membaca cabang terbaru setelah alias berubah (data dimuat ulang).
  const editingBranch =
    branchDialog.code === null
      ? null
      : (branches.find((branch) => branch.code === branchDialog.code) ?? null)
  const filteredBranches = branches.filter(
    (branch) => matchesQuery(branch, query) && matchesFilter(branch, filter)
  )
  const branchPageCount = Math.max(
    1,
    Math.ceil(filteredBranches.length / PAGE_SIZE)
  )
  const currentBranchPage = Math.min(branchPage, branchPageCount)
  const pagedBranches = filteredBranches.slice(
    (currentBranchPage - 1) * PAGE_SIZE,
    currentBranchPage * PAGE_SIZE
  )
  const pagedAreas = areas.slice(
    (areaPage - 1) * PAGE_SIZE,
    areaPage * PAGE_SIZE
  )

  const activeBranchCount = branches.filter((b) => b.isActive).length
  const nonStandardCount = branches.filter(isNonStandardCode).length
  const activeAreaCount = areas.filter((a) => a.isActive).length

  const exportBranches = () =>
    downloadCsv(
      "cabang-sparta.csv",
      ["Kode", "Nama", "Area", "Alias", "Jumlah user", "Status"],
      filteredBranches.map((b) => [
        b.code,
        b.name,
        b.areaName ?? "",
        b.aliases.map((a) => a.alias).join(" | "),
        b.userCount,
        b.isActive ? "Aktif" : "Nonaktif",
      ])
    )

  if (!canManage) {
    return (
      <AppShell session={session} onLogout={onLogout}>
        <Alert>
          <AlertTitle>Akses ditolak</AlertTitle>
          <AlertDescription>
            Halaman Data Master hanya untuk admin sistem dan admin data master.
          </AlertDescription>
        </Alert>
      </AppShell>
    )
  }

  const refreshButton = (
    <Button
      variant="outline"
      onClick={() => void refresh()}
      disabled={isRefreshing}
    >
      <RefreshCw
        data-icon="inline-start"
        className={isRefreshing ? "animate-spin" : undefined}
      />
      Muat ulang
    </Button>
  )

  return (
    <AppShell session={session} onLogout={onLogout}>
      <Tabs defaultValue="branches" className="min-w-0">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-medium sm:text-3xl">
                Data Master
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Cabang dan area yang dipakai semua modul SPARTA. Kode tidak bisa
                diubah setelah dibuat, dan data yang tidak dipakai lagi
                dinonaktifkan, bukan dihapus.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="branches">
                <Building2 data-icon="inline-start" />
                Cabang
              </TabsTrigger>
              <TabsTrigger value="areas">
                <MapIcon data-icon="inline-start" />
                Area
              </TabsTrigger>
            </TabsList>
          </div>

          {loadState.status === "loading" ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Memuat data master...
            </p>
          ) : null}

          {loadState.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Data master gagal dimuat</AlertTitle>
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
                <StatCard
                  label="Cabang aktif"
                  value={activeBranchCount}
                  icon={Building2}
                  tone="success"
                />
                <StatCard
                  label="Cabang nonaktif"
                  value={branches.length - activeBranchCount}
                  icon={CircleOff}
                />
                <StatCard
                  label="Kode tidak baku"
                  value={nonStandardCount}
                  icon={TriangleAlert}
                  tone={nonStandardCount > 0 ? "danger" : "neutral"}
                  hint={
                    nonStandardCount > 0
                      ? "Perlu dipetakan ke alias"
                      : undefined
                  }
                />
                <StatCard
                  label="Area aktif"
                  value={activeAreaCount}
                  icon={MapIcon}
                  tone="primary"
                />
              </div>

              <TabsContent value="branches">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {refreshButton}
                        <Button
                          variant="outline"
                          onClick={exportBranches}
                          disabled={filteredBranches.length === 0}
                        >
                          <Download data-icon="inline-start" />
                          Ekspor CSV
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-72">
                          <InputGroup>
                            <InputGroupAddon>
                              <Search />
                            </InputGroupAddon>
                            <InputGroupInput
                              value={query}
                              onChange={(event) => {
                                setQuery(event.target.value)
                                setBranchPage(1)
                              }}
                              placeholder="Cari kode, nama, area, atau alias"
                              aria-label="Cari cabang"
                            />
                          </InputGroup>
                        </div>
                        <Select
                          value={filter}
                          onValueChange={(value) => {
                            setFilter(value as BranchFilter)
                            setBranchPage(1)
                          }}
                        >
                          <SelectTrigger
                            className="w-full sm:w-44"
                            aria-label="Saring status cabang"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                            <SelectItem value="nonstandard">
                              Kode tidak baku
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() =>
                            setBranchDialog({ open: true, code: null })
                          }
                        >
                          <Plus data-icon="inline-start" />
                          Tambah cabang
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {nonStandardCount > 0 && filter === "nonstandard" ? (
                        <Alert>
                          <AlertTitle>
                            Cara merapikan kode tidak baku
                          </AlertTitle>
                          <AlertDescription>
                            Kode ini kemungkinan dibuat otomatis oleh sync modul
                            lama. Tambahkan namanya sebagai alias di cabang
                            resmi, lalu nonaktifkan cabang ini.
                          </AlertDescription>
                        </Alert>
                      ) : null}

                      {branches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada cabang. Tambahkan cabang pertama.
                        </p>
                      ) : filteredBranches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Tidak ada cabang yang cocok dengan pencarian atau
                          saringan ini.
                        </p>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Area</TableHead>
                                <TableHead>Alias</TableHead>
                                <TableHead className="text-right">
                                  User
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                  Aksi
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagedBranches.map((branch) => (
                                <TableRow key={branch.code}>
                                  <TableCell>
                                    <div className="flex flex-col items-start gap-1">
                                      <span className="font-medium">
                                        {branch.code}
                                      </span>
                                      {isNonStandardCode(branch) ? (
                                        <Badge variant="destructive">
                                          Kode tidak baku
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </TableCell>
                                  <TableCell>{branch.name}</TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {branch.areaName ?? "Tanpa area"}
                                  </TableCell>
                                  <TableCell>
                                    {branch.aliases.length > 0 ? (
                                      <div className="flex max-w-56 flex-wrap gap-1">
                                        {branch.aliases.map((alias) => (
                                          <Badge
                                            key={alias.id}
                                            variant="outline"
                                          >
                                            {alias.alias}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {branch.userCount}
                                  </TableCell>
                                  <TableCell>
                                    <ActiveBadge isActive={branch.isActive} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label={`Aksi cabang ${branch.code}`}
                                        >
                                          <MoreHorizontal />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onSelect={() =>
                                            setBranchDialog({
                                              open: true,
                                              code: branch.code,
                                            })
                                          }
                                        >
                                          Ubah dan atur alias
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          variant={
                                            branch.isActive
                                              ? "destructive"
                                              : "default"
                                          }
                                          onSelect={() =>
                                            void toggleBranch(branch)
                                          }
                                        >
                                          {branch.isActive
                                            ? "Nonaktifkan"
                                            : "Aktifkan kembali"}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <TablePagination
                            page={currentBranchPage}
                            pageSize={PAGE_SIZE}
                            total={filteredBranches.length}
                            onPageChange={setBranchPage}
                            itemLabel="cabang"
                          />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="areas">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between gap-2">
                      {refreshButton}
                      <Button
                        onClick={() =>
                          setAreaDialog({ open: true, area: null })
                        }
                      >
                        <Plus data-icon="inline-start" />
                        Tambah area
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {areas.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Belum ada area. Tambahkan area, lalu pilih area di
                        setiap cabang.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode</TableHead>
                              <TableHead>Nama</TableHead>
                              <TableHead className="text-right">
                                Cabang
                              </TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pagedAreas.map((area) => (
                              <TableRow key={area.code}>
                                <TableCell className="font-medium">
                                  {area.code}
                                </TableCell>
                                <TableCell>{area.name}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {area.branchCount}
                                </TableCell>
                                <TableCell>
                                  <ActiveBadge isActive={area.isActive} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Aksi area ${area.code}`}
                                      >
                                        <MoreHorizontal />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onSelect={() =>
                                          setAreaDialog({ open: true, area })
                                        }
                                      >
                                        Ubah nama
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant={
                                          area.isActive
                                            ? "destructive"
                                            : "default"
                                        }
                                        onSelect={() => void toggleArea(area)}
                                      >
                                        {area.isActive
                                          ? "Nonaktifkan"
                                          : "Aktifkan kembali"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <TablePagination
                          page={areaPage}
                          pageSize={PAGE_SIZE}
                          total={areas.length}
                          onPageChange={setAreaPage}
                          itemLabel="area"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : null}
        </div>
      </Tabs>

      {/* key berubah setiap buka/tutup agar form dimulai dari data terbaru. */}
      <MasterBranchDialog
        key={`branch-${branchDialog.code ?? "new"}-${branchDialog.open}`}
        open={branchDialog.open}
        onOpenChange={(open) =>
          setBranchDialog((current) => ({ ...current, open }))
        }
        branch={editingBranch}
        areas={areas}
        onChanged={() => void load()}
      />
      <MasterAreaDialog
        key={`area-${areaDialog.area?.code ?? "new"}-${areaDialog.open}`}
        open={areaDialog.open}
        onOpenChange={(open) =>
          setAreaDialog((current) => ({ ...current, open }))
        }
        area={areaDialog.area}
        onChanged={() => void load()}
      />
    </AppShell>
  )
}
