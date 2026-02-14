import { createHmac, timingSafeEqual } from "crypto";

type SessionPayload = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

const SESSION_COOKIE = "livequiz_session";
const SESSION_SECRET =
  process.env.LIVEQUIZ_SESSION_SECRET ?? "dev-secret-change-me";

function toBase64Url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function signValue(value: string): string {
  const digest = createHmac("sha256", SESSION_SECRET).update(value).digest();
  return toBase64Url(digest);
}

export function createSessionCookie(payload: SessionPayload): string {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readSessionCookie(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const decoded = fromBase64Url(encodedPayload);
    return JSON.parse(decoded) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
