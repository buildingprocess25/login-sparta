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
}
