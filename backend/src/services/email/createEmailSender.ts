import { EmailSender, NoopEmailSender } from "./emailSender.js";
import { HttpApiEmailSender } from "./httpApiEmailSender.js";

export function createEmailSenderFromEnv(): EmailSender {
  const provider = process.env.EMAIL_PROVIDER;

  if (provider !== "http-api") {
    return new NoopEmailSender();
  }

  const endpoint = process.env.EMAIL_API_ENDPOINT;
  const from = process.env.EMAIL_FROM;

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
