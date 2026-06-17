import { createTransport, type Transporter } from "nodemailer"

import type { AppEnv } from "../../config/env"
import type { EmailMessage, EmailProvider } from "./email.service"

export class GmailEmailProvider implements EmailProvider {
  private readonly transporter: Transporter
  private readonly from: string

  constructor(env: AppEnv) {
    this.from = `SPARTA <${env.GMAIL_USER}>`
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: env.GMAIL_USER,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
      },
    })
  }

  async send(message: EmailMessage) {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    })
  }
}
