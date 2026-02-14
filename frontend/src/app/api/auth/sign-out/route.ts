import { cookies } from "next/headers";
import { getSessionCookieName } from "../session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
