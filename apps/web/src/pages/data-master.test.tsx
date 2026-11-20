import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { handleDevMockRequest } from "@/lib/dev-mock/mock-api"
import { DataMasterPage } from "@/pages/data-master-page"

type Body = {
  data?: Array<{ code: string; branchCode: string }>
  meta?: { total: number; activeCount: number; inactiveCount: number }
  error?: { code: string }
}

async function call(path: string, method = "GET", body?: unknown) {
  const result = await handleDevMockRequest(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: result.status, body: result.body as Body }
}

describe("API tiruan toko", () => {
  it("menyaring per status dan memotong per halaman", async () => {
    const inactive = await call(
      "/v1/admin/master/stores?status=inactive&page=1&pageSize=20"
    )
    expect(inactive.body.data?.map((s) => s.code)).toEqual(["OC53"])
    expect(inactive.body.meta).toMatchObject({ total: 1, inactiveCount: 1 })

    const firstPage = await call("/v1/admin/master/stores?page=1&pageSize=2")
    expect(firstPage.body.data).toHaveLength(2)
    expect(firstPage.body.meta?.total).toBe(4)
  })

  it("menolak kode toko tidak valid dan memindahkan toko ke cabang lain", async () => {
    const invalid = await call("/v1/admin/master/stores", "POST", {
      code: "x y",
      name: "Uji",
      branchCode: "BDG",
    })
    expect(invalid.body.error?.code).toBe("INVALID_MASTER_PAYLOAD")

    await call("/v1/admin/master/stores/T968", "PATCH", { branchCode: "HEAD" })
    const moved = await call("/v1/admin/master/stores?q=T968")
    expect(moved.body.data?.[0]?.branchCode).toBe("HEAD")
  })
})

describe("API tiruan aturan brand toko", () => {
  it("menyimpan modul yang boleh menerima toko LAWSON", async () => {
    const before = await call("/v1/admin/master/store-brands")
    const lawson = (
      before.body.data as unknown as Array<{
        code: string
        moduleIds: string[]
      }>
    ).find((brand) => brand.code === "LAWSON")
    expect(lawson?.moduleIds).toEqual(["maintenance"])

    await call("/v1/admin/master/store-brands/LAWSON", "PUT", {
      moduleIds: ["maintenance", "energy"],
    })
    const after = await call("/v1/admin/master/store-brands")
    expect(
      (
        after.body.data as unknown as Array<{
          code: string
          moduleIds: string[]
        }>
      ).find((brand) => brand.code === "LAWSON")?.moduleIds
    ).toEqual(["maintenance", "energy"])
  })
})

describe("halaman Data Master", () => {
  it("menampilkan tab Toko untuk admin data master", () => {
    const html = renderToStaticMarkup(
      <DataMasterPage
        session={{
          email: "a@sparta.local",
          fullName: "Admin Uji",
          branch: "HEAD OFFICE",
          role: "MASTER_ADMIN",
          access: [],
          adminModules: [],
          mustChangePassword: false,
        }}
        onLogout={() => {}}
      />
    )
    expect(html).toContain("Toko")
    expect(html).toContain("Cabang, area, dan toko")
  })

  it("menampilkan keterangan mode baca untuk admin modul", () => {
    const html = renderToStaticMarkup(
      <DataMasterPage
        session={{
          email: "energy.admin@sparta.local",
          fullName: "Admin Energy",
          branch: "HEAD OFFICE",
          role: "USER",
          access: ["energy"],
          adminModules: ["energy"],
          mustChangePassword: false,
        }}
        onLogout={() => {}}
      />
    )
    expect(html).toContain(
      "Anda melihat Data Master dalam mode baca. Perubahan dilakukan oleh admin sistem atau admin data master."
    )
  })
})
