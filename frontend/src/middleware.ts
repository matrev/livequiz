import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "livequiz_session";
const SESSION_SECRET =
  process.env.LIVEQUIZ_SESSION_SECRET ?? "dev-secret-change-me";

type SessionPayload = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

const textEncoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payloadPart)
  );
  const expectedSignature = toBase64Url(expectedBytes);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const decoded = fromBase64Url(payloadPart);
    return JSON.parse(decoded) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session || !session.isAdmin) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quiz/create", "/quiz/edit/:path*"],
};
