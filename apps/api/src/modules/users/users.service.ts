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

    // 2. Broadcast to all active modules using Direct DB Update
    const { Client } = require("pg")
    
    const baseDbUrl = env.DATABASE_URL.replace("/sparta?", "/")
    const buildingUrl = baseDbUrl.replace("103.127.99.241:5432/", "103.127.99.241:5432/building?")
    const energyUrl = baseDbUrl.replace("103.127.99.241:5432/", "103.127.99.241:5432/energy?")
    const maintenanceUrl = baseDbUrl.replace("103.127.99.241:5432/", "103.127.99.241:5432/maintenance?")
    
    const dbUpdates = []

    if (user.modules.some(m => m.moduleId === "building" && m.isActive)) {
      dbUpdates.push(async () => {
        const client = new Client({ connectionString: buildingUrl })
        try {
          await client.connect()
          await client.query("UPDATE user_cabang SET email_sat = $1 WHERE email_sat = $2", [newEmail, oldEmail])
        } catch (err) {
          console.error(`[DB Update Error] Failed to update email in Building DB:`, err)
        } finally {
          await client.end()
        }
      })
    }

    if (user.modules.some(m => m.moduleId === "energy" && m.isActive)) {
      dbUpdates.push(async () => {
        const client = new Client({ connectionString: energyUrl })
        try {
          await client.connect()
          await client.query("UPDATE users SET email = $1 WHERE email = $2", [newEmail, oldEmail])
        } catch (err) {
          console.error(`[DB Update Error] Failed to update email in Energy DB:`, err)
        } finally {
          await client.end()
        }
      })
    }

    if (user.modules.some(m => m.moduleId === "maintenance" && m.isActive)) {
      dbUpdates.push(async () => {
        const client = new Client({ connectionString: maintenanceUrl })
        try {
          await client.connect()
          await client.query('UPDATE "User" SET email = $1 WHERE email = $2', [newEmail, oldEmail])
        } catch (err) {
          console.error(`[DB Update Error] Failed to update email in Maintenance DB:`, err)
        } finally {
          await client.end()
        }
      })
    }

    await Promise.all(dbUpdates.map(fn => fn()))
  }
}
