/**
 * Bentuk normal alias cabang: huruf besar, spasi di awal/akhir dibuang, spasi
 * ganda dirapikan. "  Head  office " dan "HEAD OFFICE" dianggap alias yang sama.
 */
export function normalizeBranchAlias(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase()
}
