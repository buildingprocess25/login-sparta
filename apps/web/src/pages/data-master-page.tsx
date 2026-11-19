import * as React from "react"
import { Loader2, Plus, Search } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { MasterAreaDialog } from "@/components/master-area-dialog"
import { MasterBranchDialog } from "@/components/master-branch-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import type { SpartaSession } from "@/lib/sparta-auth"
import {
  canManageMasterData,
  isNonStandardCode,
  listMasterAreas,
  listMasterBranches,
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

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "secondary" : "outline"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  )
}

export function DataMasterPage({ session, onLogout }: DataMasterPageProps) {
  const [branches, setBranches] = React.useState<MasterBranch[]>([])
  const [areas, setAreas] = React.useState<MasterArea[]>([])
  const [loadState, setLoadState] = React.useState<LoadState>({
    status: "loading",
  })
  const [query, setQuery] = React.useState("")
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
        message:
          error instanceof ApiClientError
            ? error.message
            : "Data master belum bisa dimuat.",
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

  // Dialog membaca cabang terbaru setelah alias berubah (data dimuat ulang).
  const editingBranch =
    branchDialog.code === null
      ? null
      : (branches.find((branch) => branch.code === branchDialog.code) ?? null)
  const filteredBranches = branches.filter((branch) =>
    matchesQuery(branch, query)
  )
  const nonStandardCount = branches.filter(isNonStandardCode).length

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

  return (
    <AppShell session={session} onLogout={onLogout}>
      <div className="flex min-w-0 flex-col gap-6">
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
          <Tabs defaultValue="branches" className="min-w-0">
            <TabsList>
              <TabsTrigger value="branches">
                Cabang ({branches.length})
              </TabsTrigger>
              <TabsTrigger value="areas">Area ({areas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="branches">
              <div className="flex min-w-0 flex-col gap-4">
                {nonStandardCount > 0 ? (
                  <Alert>
                    <AlertTitle>
                      {nonStandardCount} cabang memakai kode tidak baku
                    </AlertTitle>
                    <AlertDescription>
                      Kode ini kemungkinan dibuat otomatis oleh sync modul lama.
                      Petakan sebagai alias ke cabang resmi, lalu nonaktifkan
                      cabang dengan kode tidak baku tersebut.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full sm:max-w-sm">
                    <InputGroup>
                      <InputGroupAddon>
                        <Search />
                      </InputGroupAddon>
                      <InputGroupInput
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari kode, nama, area, atau alias"
                        aria-label="Cari cabang"
                      />
                    </InputGroup>
                  </div>
                  <Button
                    onClick={() => setBranchDialog({ open: true, code: null })}
                  >
                    <Plus data-icon="inline-start" />
                    Tambah cabang
                  </Button>
                </div>

                {branches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada cabang. Tambahkan cabang pertama.
                  </p>
                ) : filteredBranches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada cabang yang cocok dengan "{query}".
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Alias</TableHead>
                        <TableHead className="text-right">User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Aksi</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBranches.map((branch) => (
                        <TableRow key={branch.code}>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-medium">{branch.code}</span>
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
                              <div className="flex flex-wrap gap-1">
                                {branch.aliases.map((alias) => (
                                  <Badge key={alias.id} variant="outline">
                                    {alias.alias}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {branch.userCount}
                          </TableCell>
                          <TableCell>
                            <StatusBadge isActive={branch.isActive} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Ubah cabang ${branch.code}`}
                              onClick={() =>
                                setBranchDialog({
                                  open: true,
                                  code: branch.code,
                                })
                              }
                            >
                              Ubah
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="areas">
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setAreaDialog({ open: true, area: null })}
                  >
                    <Plus data-icon="inline-start" />
                    Tambah area
                  </Button>
                </div>

                {areas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada area. Tambahkan area, lalu pilih area di setiap
                    cabang.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-right">Cabang</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Aksi</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {areas.map((area) => (
                        <TableRow key={area.code}>
                          <TableCell className="font-medium">
                            {area.code}
                          </TableCell>
                          <TableCell>{area.name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {area.branchCount}
                          </TableCell>
                          <TableCell>
                            <StatusBadge isActive={area.isActive} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Ubah area ${area.code}`}
                              onClick={() =>
                                setAreaDialog({ open: true, area })
                              }
                            >
                              Ubah
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>

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
