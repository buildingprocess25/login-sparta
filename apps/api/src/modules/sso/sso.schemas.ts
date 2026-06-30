import { SPARTA_LAUNCHABLE_MODULE_IDS } from "@sparta/shared"
import { z } from "zod"

export const ssoExchangeSchema = z.object({
  moduleId: z.enum(SPARTA_LAUNCHABLE_MODULE_IDS),
  launchToken: z.string().min(20),
})

export type SsoExchangeInput = z.infer<typeof ssoExchangeSchema>
