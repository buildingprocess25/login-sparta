import type { EmailMessage, EmailProvider } from "./email.service"

export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.info(
      JSON.stringify({
        channel: "email",
        to: message.to,
        subject: message.subject,
        text: message.text,
      })
    )
  }
}
