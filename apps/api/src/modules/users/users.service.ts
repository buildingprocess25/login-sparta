import type { SpartaLaunchableModuleId } from "@sparta/shared"

import { AuthError } from "../auth/auth.service"
import type {
  CreateUserInput,
  UpdateUserInput,
  UsersRepository,
} from "./users.repository"

export type UsersServiceCreateInput = CreateUserInput
export type UsersServiceUpdateInput = UpdateUserInput

export class UsersService {
  private readonly repository: UsersRepository

  constructor(repository: UsersRepository) {
    this.repository = repository
  }

  async listUsers() {
    return this.repository.listUsers()
  }

  async createUser(input: UsersServiceCreateInput, actorUserId: string) {
    return this.repository.createUser(input, actorUserId)
  }

  async syncUser(input: import("./users.schemas").SyncUserInput) {
    const existingUser = await this.repository.findUserByEmail(input.email)
    
    if (existingUser) {
      const existingAccess = existingUser.modules.find(
        (m) => m.moduleId === input.moduleId
      )

      if (!existingAccess || !existingAccess.isActive || existingAccess.role !== input.role) {
        await this.repository.grantModuleAccess(
          existingUser.id,
          input.moduleId,
          input.role,
          null
        )
      }

      // Merge branch names
      const mergedBranchNames = new Set(existingUser.validBranchNames || [])
      if (input.branchName) {
        mergedBranchNames.add(input.branchName)
      }

      // Update core user details (name and branch) based on latest sync
      await this.repository.updateUser(
        existingUser.id,
        {
          fullName: input.fullName,
          branchCode: input.branchCode,
          branchName: input.branchName,
          validBranchNames: Array.from(mergedBranchNames),
        },
        null
      )

      return this.repository.findUserById(existingUser.id)
    }

    return this.repository.createUser(
      {
        email: input.email,
        employeeId: input.employeeId,
        fullName: input.fullName,
        branchCode: input.branchCode,
        branchName: input.branchName,
        validBranchNames: input.branchName ? [input.branchName] : [],
        role: "USER",
        modules: [{ moduleId: input.moduleId, role: input.role }],
      },
      null
    )
  }

  async syncDeleteUser(input: import("./users.schemas").SyncDeleteUserInput) {
    const existingUser = await this.repository.findUserByEmail(input.email)
    
    if (!existingUser) {
      // User already deleted or doesn't exist in SSO
      return null
    }

    // Revoke access to this specific module
    await this.repository.revokeModuleAccess(
      existingUser.id,
      input.moduleId,
      null
    )

    // Check if user has any other active modules
    const updatedUser = await this.repository.findUserById(existingUser.id)
    if (updatedUser) {
      const hasActiveModules = updatedUser.modules.some(m => m.isActive)
      
      // If no active modules left, set status to INACTIVE
      if (!hasActiveModules && updatedUser.status !== "INACTIVE") {
        await this.repository.updateUser(
          existingUser.id,
          { status: "INACTIVE" },
          null
        )
      }
    }

    return updatedUser
  }

  async updateUser(
    userId: string,
    input: UsersServiceUpdateInput,
    actorUserId: string
  ) {
    const user = await this.repository.findUserById(userId)

    if (!user) {
      throw new AuthError("User SPARTA tidak ditemukan.", 404, "USER_NOT_FOUND")
    }

    await this.repository.updateUser(userId, input, actorUserId)
  }

  async grantModuleAccess(
    userId: string,
    moduleId: SpartaLaunchableModuleId,
    role: string,
    actorUserId: string
  ) {
    const user = await this.repository.findUserById(userId)

    if (!user) {
      throw new AuthError("User SPARTA tidak ditemukan.", 404, "USER_NOT_FOUND")
    }

    await this.repository.grantModuleAccess(userId, moduleId, role, actorUserId)
  }

  async revokeModuleAccess(
    userId: string,
    moduleId: SpartaLaunchableModuleId,
    actorUserId: string
  ) {
    const user = await this.repository.findUserById(userId)

    if (!user) {
      throw new AuthError("User SPARTA tidak ditemukan.", 404, "USER_NOT_FOUND")
    }

    await this.repository.revokeModuleAccess(userId, moduleId, actorUserId)
  }

  async changeEmailAndBroadcast(userId: string, newEmail: string, env: import("../../config/env").AppEnv) {
    const user = await this.repository.findUserById(userId)
    if (!user) {
      throw new AuthError("User SPARTA tidak ditemukan.", 404, "USER_NOT_FOUND")
    }

    const oldEmail = user.email

    // 1. Update email locally
    await this.repository.updateUser(userId, { email: newEmail }, userId)

    // 2. Broadcast to all active modules
    const webhooks = []
    
    if (env.SPARTA_BUILDING_CALLBACK_URL) {
      // e.g. http://localhost:8081/api/auth/sso/callback -> http://localhost:8081/api/sso/webhook/email
      const baseUrl = new URL(env.SPARTA_BUILDING_CALLBACK_URL).origin
      webhooks.push(`${baseUrl}/api/sso/webhook/email`)
    }
    
    if (env.SPARTA_MAINTENANCE_CALLBACK_URL) {
      const baseUrl = new URL(env.SPARTA_MAINTENANCE_CALLBACK_URL).origin
      webhooks.push(`${baseUrl}/api/webhook/sso/email`)
    }
    
    if (env.SPARTA_ENERGY_CALLBACK_URL) {
      const baseUrl = new URL(env.SPARTA_ENERGY_CALLBACK_URL).origin
      webhooks.push(`${baseUrl}/api/webhook/sso/email`)
    }

    const promises = webhooks.map((url) => 
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sparta-internal-key": env.SPARTA_INTERNAL_API_KEY
        },
        body: JSON.stringify({
          oldEmail,
          newEmail
        })
      }).catch(err => console.error(`[Webhook Error] Failed to update email at ${url}:`, err))
    )

    await Promise.all(promises)
  }
}
