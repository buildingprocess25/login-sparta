import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AppShell } from "@/components/app-shell"

describe("AppShell", () => {
  it("shows public header without profile or Tanya ARTA", () => {
    const html = renderToStaticMarkup(
      <AppShell showHeader>
        <div>Content</div>
      </AppShell>
    )

    expect(html).toContain("Modul SPARTA")
    expect(html).toContain("Tentang SPARTA")
    expect(html).not.toContain("Tanya ARTA")
    expect(html).not.toContain("Profil")
  })
})
