import { EmailPayload, EmailSender } from "./emailSender.js";

interface ResendEmailSenderConfig {
  apiKey: string;
  from: string;
  timeoutMs?: number;
}

export class ResendEmailSender implements EmailSender {
  private readonly apiKey: string;
  private readonly from: string;
  private readonly timeoutMs: number;

  constructor(config: ResendEmailSenderConfig) {
    this.apiKey = config.apiKey;
    this.from = config.from;
    this.timeoutMs = config.timeoutMs ?? 5000;
  }

  async send(payload: EmailPayload): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          ...(payload.html ? { html: payload.html } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          `Resend request failed with status ${response.status}: ${responseText}`
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
