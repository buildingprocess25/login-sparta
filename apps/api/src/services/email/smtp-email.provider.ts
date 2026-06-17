import nodemailer from "nodemailer"

import type { AppEnv } from "../../config/env"
import type { EmailMessage, EmailProvider } from "./email.service"

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor(env: AppEnv) {
    this.from = env.SMTP_FROM
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
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
