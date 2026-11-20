function escapeCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value)
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Unduh baris data sebagai file CSV (UTF-8 dengan BOM agar terbaca Excel). */
export function downloadCsv(
  filename: string,
  header: string[],
  rows: Array<Array<string | number | null | undefined>>
) {
  const content = [header, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n")
  const blob = new Blob([String.fromCharCode(0xfeff) + content], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
