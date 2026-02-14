import { cookies } from "next/headers";
import { createSessionCookie, getSessionCookieName } from "../session";

type UserRole = "player" | "admin";

type UserRecord = {
  id: number | null;
  name: string;
  email: string;
  isAdmin: boolean;
};

type GetAllUsersResponse = {
  getAllUsers: UserRecord[];
};

type CreateUserResponse = {
  createUser: UserRecord;
};

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000";

const GET_ALL_USERS = `
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
      isAdmin
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser($email: String!, $name: String!, $isAdmin: Boolean) {
    createUser(email: $email, name: $name, isAdmin: $isAdmin) {
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

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    role?: UserRole;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role ?? "player";

  if (!name || !email) {
    return Response.json({ message: "Name and email are required." }, { status: 400 });
  }

  const { getAllUsers } = await fetchGraphQL<GetAllUsersResponse>(GET_ALL_USERS);
  const existingUser = getAllUsers.find(
    (user) => user.email.toLowerCase() === email
  );

  let user: UserRecord;

  if (existingUser) {
    user = existingUser;
  } else {
    const { createUser } = await fetchGraphQL<CreateUserResponse>(CREATE_USER, {
      name,
      email,
      isAdmin: role === "admin",
    });
    user = createUser;
  }

  if (!user.id) {
    return Response.json({ message: "User record is invalid." }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: getSessionCookieName(),
    value: createSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ user });
}
