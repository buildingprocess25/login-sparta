import type { AppEnv } from "../../config/env"
import { ConsoleEmailProvider } from "./console-email.provider"
import { GmailEmailProvider } from "./gmail-email.provider"

export type EmailMessage = {
  to: string
  subject: string
  text: string
}

export type EmailProvider = {
  send(message: EmailMessage): Promise<void>
}

export function createEmailProvider(env: AppEnv): EmailProvider {
  if (env.NODE_ENV === "test") {
    return new ConsoleEmailProvider()
  }

  return new GmailEmailProvider(env)
}
