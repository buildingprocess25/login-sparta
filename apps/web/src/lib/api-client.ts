import type { ApiError } from "@sparta/shared"

export class ApiClientError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, options: { code: string; status: number }) {
    super(message)
    this.name = "ApiClientError"
    this.code = options.code
    this.status = options.status
  }
}

function getApiUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null

    throw new ApiClientError(body?.error?.message ?? "Request SPARTA gagal.", {
      code: body?.error?.code ?? "SPARTA_API_ERROR",
      status: response.status,
    })
  }

  return response.json() as Promise<T>
}
