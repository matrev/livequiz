'use client'

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { getAllEntries } from "@/graphql/queries";
import EntryCard from "@/components/EntryCard";

export default function QuizResponsesPage() {
  const { data, loading, error } = useQuery(getAllEntries);

  return (
    <div style={{ padding: "24px", maxWidth: "820px", margin: "0 auto" }}>
      <Link href="/">Back to home</Link>
      <h1 style={{ marginTop: "16px" }}>All quiz responses</h1>
      {error ? (
        <p style={{ color: "#b91c1c" }}>Unable to load responses.</p>
      ) : null}
      {loading ? <p>Loading responses...</p> : null}
      {!loading && data?.getAllEntries?.length === 0 ? (
        <p>No responses submitted yet.</p>
      ) : null}
      {data?.getAllEntries?.length ? (
        <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
          {data.getAllEntries.map((response) => (
            <EntryCard key={response.id ?? `${response.quizId}-${response.authorId}`} entry={response} variant="light" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
