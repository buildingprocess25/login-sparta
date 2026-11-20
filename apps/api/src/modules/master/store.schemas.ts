import { SPARTA_MODULE_IDS } from "@sparta/shared"
import { z } from "zod"

/**
 * Kode toko baru: huruf besar dan angka, 3-10 karakter (kode Alfamart umumnya
 * 4 karakter, mis. "T968"). Kode lama hasil impor yang tidak memenuhi pola ini
 * tetap bisa diubah datanya, tetapi kodenya sendiri tidak pernah diubah.
 */
const storeCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z0-9]{3,10}$/,
        "Kode toko hanya boleh huruf dan angka, 3-10 karakter."
      )
  )

const nameSchema = z.string().trim().min(2).max(120)
const branchCodeSchema = z.string().trim().min(1).max(60)
/** String kosong dianggap "tidak diisi". */
const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value === "" ? null : value.toUpperCase()))
  .nullable()

export const STORE_OWNERSHIP_TYPES = [
  "REGULAR",
  "FRANCHISE",
  "UNKNOWN",
] as const

export const listStoresQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  branchCode: branchCodeSchema.optional(),
  brand: z
    .string()
    .trim()
    .max(60)
    .transform((value) => value.toUpperCase())
    .optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const createStoreSchema = z.object({
  code: storeCodeSchema,
  name: nameSchema,
  branchCode: branchCodeSchema,
  subArea: optionalText.default(null),
  brand: optionalText.default(null),
  ownershipType: z.enum(STORE_OWNERSHIP_TYPES).nullable().default(null),
})

export const updateStoreSchema = z
  .object({
    name: nameSchema.optional(),
    branchCode: branchCodeSchema.optional(),
    subArea: optionalText.optional(),
    brand: optionalText.optional(),
    ownershipType: z.enum(STORE_OWNERSHIP_TYPES).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  })

export type ListStoresQuery = z.infer<typeof listStoresQuerySchema>
export type CreateStoreInput = z.infer<typeof createStoreSchema>
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>

export const setBrandModulesSchema = z.object({
  moduleIds: z.array(z.enum(SPARTA_MODULE_IDS)).max(SPARTA_MODULE_IDS.length),
})

/** Query sync toko untuk modul: modul pemanggil wajib disebut. */
export const storeSyncQuerySchema = z.object({
  moduleId: z.enum(SPARTA_MODULE_IDS),
  updatedSince: z.coerce.date().optional(),
})

export type SetBrandModulesInput = z.infer<typeof setBrandModulesSchema>
