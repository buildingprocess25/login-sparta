import buildingLogo from "@/assets/building.png"
import energyLogo from "@/assets/energy.png"
import maintenanceLogo from "@/assets/maintenance.png"
import type { SpartaAppId } from "@/lib/sparta-auth"

export const SPARTA_APP_LOGOS = {
  building: buildingLogo,
  maintenance: maintenanceLogo,
  energy: energyLogo,
} satisfies Record<SpartaAppId, string>
