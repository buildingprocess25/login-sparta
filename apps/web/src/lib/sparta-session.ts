import type { SpartaSession } from "@/lib/sparta-auth"

const SPARTA_SESSION_KEY = "sparta.session.v1"
const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000

type StoredSpartaSession = SpartaSession & {
  expiresAt: number
}

const fallbackStorage = new Map<string, string>()

function getStorage() {
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage?.getItem === "function" &&
    typeof window.localStorage?.setItem === "function" &&
    typeof window.localStorage?.removeItem === "function"
  ) {
    return window.localStorage
  }

  return {
    getItem: (key: string) => fallbackStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      fallbackStorage.set(key, value)
    },
    removeItem: (key: string) => {
      fallbackStorage.delete(key)
    },
  }
}

export function saveSpartaSession(
  session: SpartaSession,
  durationMs = DEFAULT_SESSION_DURATION_MS
) {
  const storedSession: StoredSpartaSession = {
    ...session,
    expiresAt: Date.now() + durationMs,
  }

  getStorage().setItem(SPARTA_SESSION_KEY, JSON.stringify(storedSession))
}

export function getSpartaSession(): SpartaSession | null {
  const storage = getStorage()
  const rawSession = storage.getItem(SPARTA_SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const storedSession = JSON.parse(rawSession) as StoredSpartaSession

    if (Date.now() > storedSession.expiresAt) {
      storage.removeItem(SPARTA_SESSION_KEY)
      return null
    }

    return {
      email: storedSession.email,
      fullName: storedSession.fullName,
      branch: storedSession.branch,
      access: storedSession.access,
      mustChangePassword: storedSession.mustChangePassword,
    }
  } catch {
    storage.removeItem(SPARTA_SESSION_KEY)
    return null
  }
}

export function clearSpartaSession() {
  getStorage().removeItem(SPARTA_SESSION_KEY)
}
