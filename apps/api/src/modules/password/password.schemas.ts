import { z } from "zod"

export const passwordUpdateSchema = z.object({
  newPassword: z.string().min(8),
})

export const forgotOtpRequestSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
})

export const forgotOtpVerifySchema = forgotOtpRequestSchema.extend({
  otp: z.string().regex(/^\d{6}$/),
})

export const forgotPasswordResetSchema = forgotOtpVerifySchema.extend({
  newPassword: z.string().min(8),
})

export const changePasswordConfirmSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
})

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>
export type ForgotOtpRequestInput = z.infer<typeof forgotOtpRequestSchema>
export type ForgotOtpVerifyInput = z.infer<typeof forgotOtpVerifySchema>
export type ForgotPasswordResetInput = z.infer<
  typeof forgotPasswordResetSchema
>
export type ChangePasswordConfirmInput = z.infer<
  typeof changePasswordConfirmSchema
>
