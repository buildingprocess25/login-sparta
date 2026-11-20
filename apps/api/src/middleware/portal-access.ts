import {
  SPARTA_MASTER_DATA_ROLES,
  type SpartaLaunchableModuleId,
} from "@sparta/shared"
import type { Request, RequestHandler } from "express"

import { AuthError } from "../modules/auth/auth.service"

/**
 * Ruang lingkup admin di halaman Manajemen User:
 * - SYSTEM_ADMIN: semua user dan semua modul;
 * - admin modul (role ModuleRole.isModuleAdmin): hanya modul miliknya.
 */
export type UserAdminScope =
  | { all: true }
  | { all: false; modules: SpartaLaunchableModuleId[] }

declare global {
  namespace Express {
    interface Request {
      userAdminScope?: UserAdminScope
    }
  }
}

function sessionUser(request: Request) {
  const user = request.spartaSession?.user
  if (!user) {
    throw new AuthError(
      "Session SPARTA tidak ditemukan.",
      401,
      "UNAUTHENTICATED"
    )
  }
  return user
}

const forbidden = () =>
  new AuthError(
    "Akses ditolak. Role Anda tidak boleh mengakses fitur ini.",
    403,
    "FORBIDDEN"
  )

/** Manajemen User: admin sistem (semua) atau admin modul (modulnya saja). */
export const requireUserAdmin: RequestHandler = (request, _response, next) => {
  try {
    const user = sessionUser(request)
    if (user.role === "SYSTEM_ADMIN") {
      request.userAdminScope = { all: true }
    } else if (user.adminModules.length > 0) {
      request.userAdminScope = { all: false, modules: user.adminModules }
    } else {
      throw forbidden()
    }
    next()
  } catch (error) {
    next(error)
  }
}

/** Data Master baca: admin sistem, admin data master, atau admin modul. */
export const requireMasterRead: RequestHandler = (request, _response, next) => {
  try {
    const user = sessionUser(request)
    if (
      !SPARTA_MASTER_DATA_ROLES.includes(user.role) &&
      user.adminModules.length === 0
    ) {
      throw forbidden()
    }
    next()
  } catch (error) {
    next(error)
  }
}

/** Data Master ubah: hanya admin sistem dan admin data master. */
export const requireMasterWrite: RequestHandler = (
  request,
  _response,
  next
) => {
  try {
    const user = sessionUser(request)
    if (!SPARTA_MASTER_DATA_ROLES.includes(user.role)) throw forbidden()
    next()
  } catch (error) {
    next(error)
  }
}

/** true bila scope boleh mengelola modul ini. */
export function scopeAllowsModule(
  scope: UserAdminScope | undefined,
  moduleId: string
) {
  return !!scope && (scope.all || scope.modules.some((id) => id === moduleId))
}
