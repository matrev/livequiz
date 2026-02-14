"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { getAllEntries } from "@/graphql/queries";
import EntryCard from "@/components/EntryCard";

type UserRole = "player" | "admin";

type SignedInUser = {
  id?: number | null;
  name: string;
  email: string;
  isAdmin: boolean;
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: allEntriesData, loading: isLoadingEntries } = useQuery(getAllEntries);

  const responseCount = useMemo(() => {
    if (!allEntriesData?.getAllEntries?.length) {
      return 0;
    }
    return allEntriesData.getAllEntries.length;
  }, [allEntriesData]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && email.includes("@");
  }, [name, email]);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { user: SignedInUser };
        if (payload?.user && isActive) {
          setSignedInUser(payload.user);
          setRole(payload.user.isAdmin ? "admin" : "player");
          setIsSignedIn(true);
          setName(payload.user.name);
          setEmail(payload.user.email);
        }
      } catch (sessionError) {
        if (isActive) {
          setError("Unable to restore your session.");
        }
      } finally {
        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    };

    loadSession();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Please enter a name and a valid email address.");
      return;
    }
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          role,
        }),
      });

      if (!response.ok) {
        setError("We could not sign you in. Please try again.");
        return;
      }

      const payload = (await response.json()) as { user: SignedInUser };
      if (!payload?.user) {
        setError("We could not sign you in. Please try again.");
        return;
      }

      setSignedInUser(payload.user);
      setRole(payload.user.isAdmin ? "admin" : "player");
      setIsSignedIn(true);
    } catch (submitError) {
      setError("Sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRole = signedInUser
    ? signedInUser.isAdmin
      ? "admin"
      : "player"
    : role;

  return (
    <div className="landing-bg relative min-h-screen overflow-hidden">
      <div className="landing-orb landing-orb-left" />
      <div className="landing-orb landing-orb-right" />
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <section className="fade-up flex flex-1 flex-col gap-6">
          <p className="text-pretty text-lg text-white/75">
            Sign in with a name and email, then jump into creation or play.
            Admins can manage quizzes; players can join instantly.
          </p>
          {isSignedIn ? (
            <div className="landing-panel mt-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                Signed in
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                Welcome, {signedInUser?.name || name || "Player"}
              </p>
              <p className="mt-2 text-white/70">
                Role: {activeRole === "admin" ? "Admin" : "Player"}
              </p>
              {signedInUser?.email ? (
                <p className="mt-1 text-sm text-white/60">
                  {signedInUser.email}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {activeRole === "admin" ? (
                  <>
                    <Link className="landing-btn" href="/quiz/create">
                      Create a quiz
                    </Link>
                    <Link className="landing-btn landing-btn-outline" href="/quiz/edit">
                      Edit quizzes
                    </Link>
                  </>
                ) : (
                  <Link className="landing-btn" href="/quiz/join">
                    Join a quiz
                  </Link>
                )}
                <button
                  className="landing-btn landing-btn-ghost"
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/sign-out", { method: "POST" });
                    setIsSignedIn(false);
                    setSignedInUser(null);
                  }}
                >
                  Edit details
                </button>
              </div>
            </div>
          ) : (
            <form className="landing-card mt-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="landing-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="landing-input"
                    id="name"
                    name="name"
                    placeholder="Jordan Lee"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="landing-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="landing-input"
                    id="email"
                    name="email"
                    placeholder="you@livequiz.app"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <label className="landing-label" htmlFor="role">
                    Role
                  </label>
                  <select
                    className="landing-input"
                    id="role"
                    name="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                  >
                    <option value="player">Player</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {error ? <p className="mt-4 text-sm text-rose-100">{error}</p> : null}
              {isCheckingSession ? (
                <p className="mt-4 text-sm text-white/70">Checking session...</p>
              ) : null}
              <button
                className="landing-btn mt-6 w-full"
                type="submit"
                disabled={!canSubmit || isSubmitting || isCheckingSession}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </section>
        <section className="fade-up flex w-full max-w-md flex-col gap-5">
          <div className="landing-card">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Live responses
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {isLoadingEntries
                ? "Loading responses..."
                : `${responseCount} responses submitted`}
            </h2>
            <p className="mt-2 text-white/70">
              See the latest quiz submissions right on the homepage.
            </p>
            {allEntriesData?.getAllEntries?.length ? (
              <div className="mt-4 flex flex-col gap-3">
                {allEntriesData.getAllEntries.map((entry) => (
                  <EntryCard key={entry.id ?? `${entry.quizId}-${entry.authorId}`} entry={entry} variant="dark" />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
