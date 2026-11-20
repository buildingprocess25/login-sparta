import * as React from "react"
import type { MasterStoreStatusFilter } from "@sparta/shared"
import {
  CircleCheck,
  CircleOff,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Split,
  Store,
} from "lucide-react"
import { toast } from "sonner"

import { MasterStoreDialog } from "@/components/master-store-dialog"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { StoreBrandAccess } from "@/components/store-brand-access"
import { TablePagination } from "@/components/table-pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  listMasterStores,
  listStoreBrands,
  STORE_OWNERSHIP_LABEL,
  updateMasterStore,
  type MasterBranch,
  type MasterStore,
  type MasterStoreMeta,
} from "@/lib/sparta-master-admin"

const ALL_BRANCHES = "__all__"
const ALL_BRANDS = "__all__"
const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 300

type MasterStorePanelProps = {
  /** Cabang untuk saringan dan form toko. */
  branches: MasterBranch[]
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" }

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}

/** Isi tab Toko di Data Master: daftar dipaginasi dan dicari di server. */
export function MasterStorePanel({ branches }: MasterStorePanelProps) {
  const [stores, setStores] = React.useState<MasterStore[]>([])
  const [meta, setMeta] = React.useState<MasterStoreMeta | null>(null)
  const [loadState, setLoadState] = React.useState<LoadState>({
    status: "loading",
  })
  const [isFetching, setIsFetching] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [branchCode, setBranchCode] = React.useState(ALL_BRANCHES)
  const [brand, setBrand] = React.useState(ALL_BRANDS)
  const [brandOptions, setBrandOptions] = React.useState<string[]>([])
  const [status, setStatus] = React.useState<MasterStoreStatusFilter>("all")
  const [page, setPage] = React.useState(1)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [dialog, setDialog] = React.useState<{
    open: boolean
    store: MasterStore | null
  }>({ open: false, store: null })

  // Pilihan saringan brand diambil dari data (ALFAMART, LAWSON, dst.).
  React.useEffect(() => {
    let cancelled = false
    listStoreBrands()
      .then((brands) => {
        if (!cancelled) setBrandOptions(brands.map((item) => item.code))
      })
      .catch(() => {
        // Saringan brand opsional; daftar toko tetap bisa dipakai tanpanya.
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    let cancelled = false
    // Muat di frame berikutnya: setState tidak dipanggil langsung di effect.
    const frame = requestAnimationFrame(() => {
      setIsFetching(true)
      listMasterStores({
        q: debouncedQuery,
        branchCode: branchCode === ALL_BRANCHES ? null : branchCode,
        brand: brand === ALL_BRANDS ? null : brand,
        status,
        page,
        pageSize: PAGE_SIZE,
      })
        .then((result) => {
          if (cancelled) return
          setStores(result.data)
          setMeta(result.meta)
          setLoadState({ status: "ready" })
        })
        .catch((error: unknown) => {
          if (cancelled) return
          setLoadState({
            status: "error",
            message: errorMessage(error, "Daftar toko belum bisa dimuat."),
          })
        })
        .finally(() => {
          if (!cancelled) setIsFetching(false)
        })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [debouncedQuery, branchCode, brand, status, page, reloadKey])

  const reload = () => setReloadKey((value) => value + 1)

  const toggleStore = async (store: MasterStore) => {
    try {
      await updateMasterStore(store.code, { isActive: !store.isActive })
      toast.success(
        `Toko ${store.code} ${store.isActive ? "dinonaktifkan" : "diaktifkan"}.`
      )
      reload()
    } catch (error) {
      toast.error(errorMessage(error, "Status toko belum berubah."))
    }
  }

  const hasFilter =
    query.trim() !== "" ||
    branchCode !== ALL_BRANCHES ||
    brand !== ALL_BRANDS ||
    status !== "all"
  const activeBranches = branches.filter((branch) => branch.isActive)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {meta ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total toko"
            value={meta.activeCount + meta.inactiveCount}
            icon={Store}
          />
          <StatCard
            label="Toko aktif"
            value={meta.activeCount}
            icon={CircleCheck}
            tone="success"
          />
          <StatCard
            label="Toko nonaktif"
            value={meta.inactiveCount}
            icon={CircleOff}
          />
          <StatCard
            label="Tanpa sub-area"
            value={meta.withoutSubAreaCount}
            icon={Split}
            tone="primary"
            hint="Belum dibagi ke sub-area cabang"
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="w-full lg:max-w-sm">
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPage(1)
                    }}
                    placeholder="Cari kode, nama toko, atau sub-area"
                    aria-label="Cari toko"
                  />
                </InputGroup>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:justify-end">
                <Select
                  value={branchCode}
                  onValueChange={(value) => {
                    setBranchCode(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    className="w-full lg:w-52"
                    aria-label="Saring cabang"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANCHES}>Semua cabang</SelectItem>
                    {activeBranches.map((branch) => (
                      <SelectItem key={branch.code} value={branch.code}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={brand}
                  onValueChange={(value) => {
                    setBrand(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    className="w-full lg:w-40"
                    aria-label="Saring brand toko"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANDS}>Semua brand</SelectItem>
                    {brandOptions.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value as MasterStoreStatusFilter)
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    className="w-full lg:w-40"
                    aria-label="Saring status toko"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Muat ulang daftar toko"
                  onClick={reload}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={isFetching ? "animate-spin" : undefined}
                  />
                </Button>
                <Button onClick={() => setDialog({ open: true, store: null })}>
                  <Plus data-icon="inline-start" />
                  Tambah toko
                </Button>
              </div>
            </div>
            <StoreBrandAccess />
          </div>
        </CardHeader>
        <CardContent>
          {loadState.status === "loading" ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Memuat daftar toko...
            </p>
          ) : null}

          {loadState.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Daftar toko gagal dimuat</AlertTitle>
              <AlertDescription>
                <div className="flex flex-col items-start gap-3">
                  <span>{loadState.message}</span>
                  <Button variant="outline" size="sm" onClick={reload}>
                    Coba lagi
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          {loadState.status === "ready" && meta ? (
            meta.total === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  {hasFilter
                    ? "Tidak ada toko yang cocok dengan pencarian atau saringan ini."
                    : "Belum ada toko. Tambahkan toko pertama."}
                </p>
                {hasFilter ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("")
                      setBranchCode(ALL_BRANCHES)
                      setBrand(ALL_BRANDS)
                      setStatus("all")
                      setPage(1)
                    }}
                  >
                    Hapus saringan
                  </Button>
                ) : null}
              </div>
            ) : (
              <div
                className="flex flex-col gap-4 transition-opacity data-[fetching=true]:opacity-60"
                data-fetching={isFetching}
                aria-busy={isFetching}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama toko</TableHead>
                      <TableHead>Cabang</TableHead>
                      <TableHead>Sub-area</TableHead>
                      <TableHead>Kepemilikan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.map((store) => (
                      <TableRow key={store.code}>
                        <TableCell className="font-medium tabular-nums">
                          {store.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{store.name}</span>
                            {store.brand && store.brand !== "ALFAMART" ? (
                              <span className="text-xs text-muted-foreground">
                                {store.brand}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{store.branchName}</span>
                            {store.branchCode !== store.branchName ? (
                              <span className="text-xs text-muted-foreground">
                                {store.branchCode}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell
                          className={
                            store.subArea ? undefined : "text-muted-foreground"
                          }
                        >
                          {store.subArea ?? "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {store.ownershipType
                            ? (STORE_OWNERSHIP_LABEL[store.ownershipType] ??
                              store.ownershipType)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={store.isActive ? "Aktif" : "Nonaktif"}
                            tone={store.isActive ? "success" : "neutral"}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Aksi toko ${store.code}`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  setDialog({ open: true, store })
                                }
                              >
                                Ubah data toko
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant={
                                  store.isActive ? "destructive" : "default"
                                }
                                onSelect={() => void toggleStore(store)}
                              >
                                {store.isActive
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
                  page={meta.page}
                  pageSize={meta.pageSize}
                  total={meta.total}
                  onPageChange={setPage}
                  itemLabel="toko"
                />
              </div>
            )
          ) : null}
        </CardContent>
      </Card>

      {/* key berubah setiap buka/tutup agar form dimulai dari data terbaru. */}
      <MasterStoreDialog
        key={`store-${dialog.store?.code ?? "new"}-${dialog.open}`}
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        store={dialog.store}
        branches={branches}
        onChanged={reload}
      />
    </div>
  )
}
