import { EmailPayload, EmailSender } from "./emailSender.js";

interface HttpApiEmailSenderConfig {
  endpoint: string;
  from: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class HttpApiEmailSender implements EmailSender {
  private readonly endpoint: string;
  private readonly from: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: HttpApiEmailSenderConfig) {
    this.endpoint = config.endpoint;
    this.from = config.from;
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 5000;
  }

  async send(payload: EmailPayload): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          ...(payload.html ? { html: payload.html } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          `Email API request failed with status ${response.status}: ${responseText}`
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
