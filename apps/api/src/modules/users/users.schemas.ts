import { SPARTA_MODULE_IDS } from "@sparta/shared"
import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  employeeId: z.string().trim().min(1).nullable().default(null),
  fullName: z.string().trim().min(1),
  branchCode: z.string().trim().min(1),
  branchName: z.string().trim().min(1),
  role: z.enum(["USER", "SYSTEM_ADMIN"]).default("USER"),
  modules: z
    .array(
      z.object({
        moduleId: z.enum(SPARTA_MODULE_IDS),
        role: z.string().trim().min(1).default("USER"),
      })
    )
    .default([]),
})

export const updateUserSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()).optional(),
  employeeId: z.string().trim().min(1).nullable().optional(),
  fullName: z.string().trim().min(1).optional(),
  branchCode: z.string().trim().min(1).optional(),
  branchName: z.string().trim().min(1).optional(),
  role: z.enum(["USER", "SYSTEM_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
})

export const accessUpdateSchema = z.object({
  role: z.string().trim().min(1).default("USER"),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type AccessUpdateInput = z.infer<typeof accessUpdateSchema>
