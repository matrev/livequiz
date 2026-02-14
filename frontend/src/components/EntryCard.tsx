'use client'

import Link from "next/link";

type Entry = {
  id?: number | null;
  title: string;
  quizId: number;
  authorId: number;
  answers?: Record<string, string> | null;
  updatedAt: string;
};

type EntryCardProps = {
  entry: Entry;
  variant?: 'dark' | 'light';
};

export default function EntryCard({ entry, variant = 'light' }: EntryCardProps) {
  const answerCount = entry.answers
    ? Object.keys(entry.answers).length
    : 0;

  if (variant === 'dark') {
    return (
      <Link
        key={entry.id ?? `${entry.quizId}-${entry.authorId}`}
        href={`/quiz/responses/${entry.quizId}`}
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-white/30 hover:bg-white/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {entry.title}
            </p>
            <p className="mt-1 text-xs text-white/60">
              Participant #{entry.authorId} · {answerCount} answers
            </p>
            <p className="mt-1 text-xs text-white/50">
              Updated {new Date(entry.updatedAt).toLocaleString()}
            </p>
          </div>
          <button
            className="mt-1 whitespace-nowrap rounded bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/quiz/responses/${entry.quizId}`;
            }}
          >
            Edit
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      key={entry.id ?? `${entry.quizId}-${entry.authorId}`}
      href={`/quiz/responses/${entry.quizId}`}
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        padding: "16px",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        gap: "12px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#9ca3af";
        e.currentTarget.style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#d1d5db";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0 }}>{entry.title}</h2>
        <p style={{ marginTop: "6px", color: "#6b7280", margin: 0 }}>
          Participant #{entry.authorId} · {answerCount} answers
        </p>
        <p style={{ marginTop: "6px", color: "#9ca3af", margin: 0 }}>
          Last updated: {new Date(entry.updatedAt).toLocaleString()}
        </p>
      </div>
      <button
        style={{
          padding: "8px 16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "6px",
          color: "#1e40af",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          marginTop: "4px",
        }}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = `/quiz/responses/${entry.quizId}`;
        }}
      >
        Edit
      </button>
    </Link>
  );
}
