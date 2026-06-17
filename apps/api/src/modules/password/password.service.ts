import type { AppEnv } from "../../config/env"
import type { EmailProvider } from "../../services/email/email.service"
import { hashPassword } from "../../services/security/password-hash"
import { generateOtpCode, hashOtpCode } from "../../services/security/otp"
import type { AuthUserRecord } from "../auth/auth.repository"
import { AuthError } from "../auth/auth.service"
import type {
  OtpChallengeRecord,
  PasswordOtpPurpose,
  PasswordRepository,
} from "./password.repository"
import type {
  ChangePasswordConfirmInput,
  ForgotOtpRequestInput,
  ForgotOtpVerifyInput,
  ForgotPasswordResetInput,
  PasswordUpdateInput,
} from "./password.schemas"

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5

export class PasswordService {
  private readonly repository: PasswordRepository
  private readonly emailProvider: EmailProvider
  private readonly env: AppEnv

  constructor(
    repository: PasswordRepository,
    emailProvider: EmailProvider,
    env: AppEnv
  ) {
    this.repository = repository
    this.emailProvider = emailProvider
    this.env = env
  }

  async setFirstPassword(user: AuthUserRecord, input: PasswordUpdateInput) {
    this.assertValidNewPassword(user, input.newPassword)

    await this.repository.updateUserPassword(
      user.id,
      await hashPassword(input.newPassword)
    )
  }

  async requestForgotPasswordOtp(input: ForgotOtpRequestInput) {
    const user = await this.repository.findUserByEmail(input.email)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    if (!user) {
      return { email: input.email, expiresAt }
    }

    await this.createAndSendOtp(user, "FORGOT_PASSWORD", expiresAt)

    return { email: user.email, expiresAt }
  }

  async verifyForgotPasswordOtp(input: ForgotOtpVerifyInput) {
    await this.verifyOtp(input.email, "FORGOT_PASSWORD", input.otp, false)
  }

  async resetForgotPassword(input: ForgotPasswordResetInput) {
    const user = await this.repository.findUserByEmail(input.email)

    if (!user) {
      throw new AuthError(
        "Kode OTP tidak valid atau sudah kedaluwarsa.",
        400,
        "INVALID_OTP"
      )
    }

    await this.verifyOtp(user.email, "FORGOT_PASSWORD", input.otp, true)
    this.assertValidNewPassword(user, input.newPassword)
    await this.repository.updateUserPassword(
      user.id,
      await hashPassword(input.newPassword)
    )
  }

  async requestChangePasswordOtp(user: AuthUserRecord) {
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)
    await this.createAndSendOtp(user, "CHANGE_PASSWORD", expiresAt)

    return { email: user.email, expiresAt }
  }

  async confirmChangePassword(
    user: AuthUserRecord,
    input: ChangePasswordConfirmInput
  ) {
    await this.verifyOtp(user.email, "CHANGE_PASSWORD", input.otp, true)
    this.assertValidNewPassword(user, input.newPassword)
    await this.repository.updateUserPassword(
      user.id,
      await hashPassword(input.newPassword)
    )
  }

  private assertValidNewPassword(user: AuthUserRecord, password: string) {
    if (password.length < 8) {
      throw new AuthError(
        "Password baru minimal 8 karakter.",
        400,
        "INVALID_PASSWORD"
      )
    }

    if (password === user.branchName.toUpperCase()) {
      throw new AuthError(
        "Password baru belum memenuhi kebijakan keamanan.",
        400,
        "INVALID_PASSWORD"
      )
    }
  }

  private async createAndSendOtp(
    user: AuthUserRecord,
    purpose: PasswordOtpPurpose,
    expiresAt: Date
  ) {
    const otp = generateOtpCode()

    await this.repository.createOtpChallenge({
      userId: user.id,
      email: user.email,
      purpose,
      codeHash: hashOtpCode(this.env.OTP_PEPPER, user.email, purpose, otp),
      maxAttempts: MAX_OTP_ATTEMPTS,
      expiresAt,
    })

    await this.emailProvider.send({
      to: user.email,
      subject: "Kode OTP SPARTA",
      text: `Kode OTP SPARTA Anda adalah ${otp}. Kode berlaku selama 10 menit.`,
    })
  }

  private async verifyOtp(
    email: string,
    purpose: PasswordOtpPurpose,
    otp: string,
    consume: boolean
  ) {
    const challenge = await this.repository.findActiveOtpChallenge(
      email.toLowerCase(),
      purpose
    )

    if (!challenge) {
      throw new AuthError(
        "Kode OTP tidak valid atau sudah kedaluwarsa.",
        400,
        "INVALID_OTP"
      )
    }

    await this.assertOtpNotExpired(challenge)

    const codeHash = hashOtpCode(this.env.OTP_PEPPER, email, purpose, otp)

    if (challenge.codeHash !== codeHash) {
      await this.handleInvalidOtpAttempt(challenge)
    }

    if (consume) {
      await this.repository.updateOtpChallenge(challenge.id, {
        status: "CONSUMED",
        consumedAt: new Date(),
      })
    }
  }

  private async assertOtpNotExpired(challenge: OtpChallengeRecord) {
    if (challenge.expiresAt > new Date()) {
      return
    }

    await this.repository.updateOtpChallenge(challenge.id, {
      status: "EXPIRED",
    })

    throw new AuthError(
      "Kode OTP tidak valid atau sudah kedaluwarsa.",
      400,
      "EXPIRED_OTP"
    )
  }

  private async handleInvalidOtpAttempt(
    challenge: OtpChallengeRecord
  ): Promise<never> {
    const attempts = challenge.attempts + 1
    const isBlocked = attempts >= challenge.maxAttempts

    await this.repository.updateOtpChallenge(challenge.id, {
      attempts,
      status: isBlocked ? "BLOCKED" : "ACTIVE",
    })

    throw new AuthError(
      "Kode OTP tidak valid atau sudah kedaluwarsa.",
      isBlocked ? 429 : 400,
      isBlocked ? "OTP_BLOCKED" : "INVALID_OTP"
    )
  }
}
