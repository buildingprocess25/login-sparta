import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AppShell } from "@/components/app-shell"
import { handleDevMockRequest } from "@/lib/dev-mock/mock-api"
import type { SpartaSession } from "@/lib/sparta-auth"

function sessionWithRole(
  role: SpartaSession["role"],
  adminModules: SpartaSession["adminModules"] = []
): SpartaSession {
  return {
    email: "uji@sparta.local",
    fullName: "Akun Uji",
    branch: "HEAD OFFICE",
    role,
    access: [],
    adminModules,
    mustChangePassword: false,
  }
}

function renderNav(
  role: SpartaSession["role"],
  adminModules: SpartaSession["adminModules"] = []
) {
  return renderToStaticMarkup(
    <AppShell session={sessionWithRole(role, adminModules)}>
      <div />
    </AppShell>
  )
}

describe("navigasi Manajemen User", () => {
  it("muncul untuk SYSTEM_ADMIN dan admin modul", () => {
    expect(renderNav("SYSTEM_ADMIN")).toContain("Manajemen User")
    expect(renderNav("MASTER_ADMIN")).not.toContain("Manajemen User")
    expect(renderNav("USER")).not.toContain("Manajemen User")
    expect(renderNav("USER", ["energy"])).toContain("Manajemen User")
  })

  it("Data Master muncul untuk SYSTEM_ADMIN, MASTER_ADMIN, dan admin modul", () => {
    expect(renderNav("SYSTEM_ADMIN")).toContain("Data Master")
    expect(renderNav("MASTER_ADMIN")).toContain("Data Master")
    expect(renderNav("USER")).not.toContain("Data Master")
    expect(renderNav("USER", ["energy"])).toContain("Data Master")
  })
})

type Body = { data?: unknown; error?: { code: string } }

async function call(path: string, method = "GET", body?: unknown) {
  const result = await handleDevMockRequest(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: result.status, body: result.body as Body }
}

describe("API tiruan Manajemen User", () => {
  it("membuat user, mengubah akses, dan mencatat event provisioning", async () => {
    const created = await call("/v1/admin/users", "POST", {
      email: "Baru@Sparta.Local",
      employeeId: "20000001",
      fullName: "User Baru",
      branchCode: "BDG",
      branchName: "Bandung",
      role: "USER",
      modules: [{ moduleId: "energy", role: "AUDITOR" }],
    })
    expect(created.status).toBe(201)
    const user = created.body.data as { id: string; email: string }
    expect(user.email).toBe("baru@sparta.local")

    const duplicate = await call("/v1/admin/users", "POST", {
      email: "baru@sparta.local",
      modules: [],
    })
    expect(duplicate.status).toBe(409)

    const badRole = await call(
      `/v1/admin/users/${user.id}/access/maintenance`,
      "PUT",
      { role: "TIDAK_ADA" }
    )
    expect(badRole.body.error?.code).toBe("MODULE_ROLE_UNKNOWN")

    // Building tidak punya katalog role: role bebas diterima.
    const building = await call(
      `/v1/admin/users/${user.id}/access/building`,
      "PUT",
      { role: "KONTRAKTOR" }
    )
    expect(building.status).toBe(200)

    await call(`/v1/admin/users/${user.id}/access/energy`, "DELETE")

    const events = await call(`/v1/admin/users/${user.id}/provisioning-events`)
    const list = events.body.data as Array<{
      type: string
      moduleId: string
      status: string
      userId?: string
    }>
    expect(list.map((e) => `${e.type}:${e.moduleId}:${e.status}`)).toEqual([
      "access.revoked:energy:DELIVERED",
      "access.granted:building:SKIPPED",
      "access.granted:energy:DELIVERED",
    ])
    expect(list[0]).not.toHaveProperty("userId")
  })

  it("hanya event FAILED yang bisa dikirim ulang", async () => {
    const retried = await call(
      "/v1/admin/users/provisioning-events/mock-event-2/retry",
      "POST"
    )
    expect(retried.status).toBe(200)

    const again = await call(
      "/v1/admin/users/provisioning-events/mock-event-2/retry",
      "POST"
    )
    expect(again.body.error?.code).toBe("PROVISIONING_EVENT_NOT_RETRYABLE")
  })
})
