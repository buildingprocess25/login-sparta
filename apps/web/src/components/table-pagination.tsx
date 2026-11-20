import * as React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type TablePaginationProps = {
  /** Halaman aktif, mulai dari 1. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /** Nama benda yang dihitung, misalnya "user" atau "cabang". */
  itemLabel: string
}

/** Nomor halaman yang ditampilkan: 1, ..., sekitar halaman aktif, ..., terakhir. */
function pageNumbers(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }
  const middle = [page - 1, page, page + 1].filter(
    (value) => value > 1 && value < pageCount
  )
  const result: Array<number | "gap"> = [1]
  if (middle[0] > 2) result.push("gap")
  result.push(...middle)
  if (middle[middle.length - 1] < pageCount - 1) result.push("gap")
  result.push(pageCount)
  return result
}

/**
 * Paginasi sisi klien untuk tabel admin. Aplikasi memakai routing hash, jadi
 * setiap tautan mencegah navigasi bawaan agar route tidak berubah.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  const go = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    if (target >= 1 && target <= pageCount && target !== page) {
      onPageChange(target)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground tabular-nums">
        Menampilkan {first}-{last} dari {total} {itemLabel}
      </p>
      {pageCount > 1 ? (
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Sebelumnya"
                  aria-label="Halaman sebelumnya"
                  aria-disabled={page === 1}
                  onClick={go(page - 1)}
                />
              </PaginationItem>
              {pageNumbers(page, pageCount).map((value, index) =>
                value === "gap" ? (
                  <PaginationItem key={`gap-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={value}>
                    <PaginationLink
                      href="#"
                      isActive={value === page}
                      aria-label={`Halaman ${value}`}
                      onClick={go(value)}
                    >
                      {value}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Berikutnya"
                  aria-label="Halaman berikutnya"
                  aria-disabled={page === pageCount}
                  onClick={go(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}
