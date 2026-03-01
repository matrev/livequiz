"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between">
        <section className="fade-up flex flex-1 flex-col gap-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome to LiveQuiz</h1>
          <p className="text-pretty text-base text-white/75 sm:text-lg">
            Create quizzes and challenge others in real-time, or join existing quizzes and compete for the top score.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-5">
            <Link className="landing-btn inline-flex min-h-11 items-center justify-center text-sm sm:text-base" href="/quiz/create">
              Create a quiz
            </Link>
            <Link
              className="landing-btn landing-btn-outline inline-flex min-h-11 items-center justify-center text-sm sm:text-base"
              href="/quiz/join"
            >
              Join a quiz
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
