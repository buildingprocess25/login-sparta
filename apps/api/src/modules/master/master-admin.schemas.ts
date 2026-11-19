import { z } from "zod"

/**
 * Kode baru: huruf besar, angka, "-" atau "_", 2-20 karakter. Kode lama yang
 * tidak memenuhi pola ini (mis. dibuat otomatis oleh sync) tetap bisa diubah
 * nama/status-nya, tetapi kodenya sendiri tidak pernah bisa diubah.
 */
const masterCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^[A-Z0-9_-]{2,20}$/,
        "Kode hanya boleh huruf, angka, - atau _, 2-20 karakter."
      )
  )

const nameSchema = z.string().trim().min(2).max(120)
const addressSchema = z.string().trim().max(500)

export const createBranchSchema = z.object({
  code: masterCodeSchema,
  name: nameSchema,
  address: addressSchema.nullable().default(null),
  areaCode: masterCodeSchema.nullable().default(null),
})

export const updateBranchSchema = z
  .object({
    name: nameSchema.optional(),
    address: addressSchema.nullable().optional(),
    areaCode: masterCodeSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  })

export const createAreaSchema = z.object({
  code: masterCodeSchema,
  name: nameSchema,
})

export const updateAreaSchema = z
  .object({
    name: nameSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  })

export const createAliasSchema = z.object({
  alias: z.string().trim().min(2).max(120),
})

export type CreateBranchInput = z.infer<typeof createBranchSchema>
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>
export type CreateAreaInput = z.infer<typeof createAreaSchema>
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>
