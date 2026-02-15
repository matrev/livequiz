"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { getAllEntries } from "@/graphql/queries";
import EntryCard from "@/components/EntryCard";

export default function Home() {
  const { data: allEntriesData, loading: isLoadingEntries } = useQuery(getAllEntries);

  const responseCount = useMemo(() => {
    if (!allEntriesData?.getAllEntries?.length) {
      return 0;
    }
    return allEntriesData.getAllEntries.length;
  }, [allEntriesData]);

  return (
    <div className="landing-bg relative min-h-screen overflow-hidden">
      <div className="landing-orb landing-orb-left" />
      <div className="landing-orb landing-orb-right" />
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <section className="fade-up flex flex-1 flex-col gap-6">
          <h1 className="text-4xl font-bold text-white">Welcome to LiveQuiz</h1>
          <p className="text-pretty text-lg text-white/75">
            Create quizzes and challenge others in real-time, or join existing quizzes and compete for the top score.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="landing-btn" href="/quiz/create">
              Create a quiz
            </Link>
            <Link className="landing-btn landing-btn-outline" href="/quiz/join">
              Join a quiz
            </Link>
          </div>
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
