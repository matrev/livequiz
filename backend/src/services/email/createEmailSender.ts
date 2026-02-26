import { EmailSender, NoopEmailSender } from "./emailSender.js";
import { HttpApiEmailSender } from "./httpApiEmailSender.js";
import { ResendEmailSender } from "./resendEmailSender.js";

export function createEmailSenderFromEnv(): EmailSender {
  const provider = process.env.EMAIL_PROVIDER;
  const from = process.env.EMAIL_FROM;

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || !from) {
      console.warn(
        "EMAIL_PROVIDER is set to resend but RESEND_API_KEY/EMAIL_FROM is missing. Falling back to noop email sender."
      );
      return new NoopEmailSender();
    }

    return new ResendEmailSender({
      apiKey,
      from,
    });
  }

  if (provider !== "http-api") {
    return new NoopEmailSender();
  }

  const endpoint = process.env.EMAIL_API_ENDPOINT;

  if (!endpoint || !from) {
    console.warn(
      "EMAIL_PROVIDER is set to http-api but EMAIL_API_ENDPOINT/EMAIL_FROM is missing. Falling back to noop email sender."
    );
    return new NoopEmailSender();
  }

  return new HttpApiEmailSender({
    endpoint,
    from,
    apiKey: process.env.EMAIL_API_KEY,
  });
}
