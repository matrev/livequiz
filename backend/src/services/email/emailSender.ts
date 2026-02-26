export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSender {
  send(payload: EmailPayload): Promise<void>;
}

export class NoopEmailSender implements EmailSender {
  async send(_: EmailPayload): Promise<void> {
    return;
  }
}
