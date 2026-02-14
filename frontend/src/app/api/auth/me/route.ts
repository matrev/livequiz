import { cookies } from "next/headers";
import { getSessionCookieName, readSessionCookie } from "../session";

type UserRecord = {
  id: number | null;
  name: string;
  email: string;
  isAdmin: boolean;
};

type GetUserResponse = {
  getUser: UserRecord | null;
};

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000";

const GET_USER = `
  query GetUser($id: Int!) {
    getUser(id: $id) {
      id
      name
      email
      isAdmin
    }
  }
`;

async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("GraphQL request failed.");
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "GraphQL error.");
  }

  if (!payload.data) {
    throw new Error("GraphQL response missing data.");
  }

  return payload.data;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = readSessionCookie(token);

  if (!session) {
    return Response.json({ message: "Not signed in." }, { status: 401 });
  }

  const { getUser } = await fetchGraphQL<GetUserResponse>(GET_USER, {
    id: session.id,
  });

  if (!getUser || !getUser.id) {
    cookieStore.set({
      name: getSessionCookieName(),
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return Response.json({ message: "Session expired." }, { status: 401 });
  }

  return Response.json({ user: getUser });
}
