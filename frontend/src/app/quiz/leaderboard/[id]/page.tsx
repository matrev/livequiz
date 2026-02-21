'use client'

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useSubscription } from "@apollo/client/react";
import { getLeaderboardForQuiz } from "@/graphql/queries";
import { leaderboardUpdated } from "@/graphql/subscriptions";
import { GetLeaderboardForQuizQuery } from "@/generated/types";

type LeaderboardRow = GetLeaderboardForQuizQuery["getLeaderboardForQuiz"][number];

const getSortableTime = (value: unknown): number => {
    if (!value) {
        return 0;
    }

    const timestamp = new Date(String(value)).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function QuizLeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = Number(params.id);
    const hasValidQuizId = Number.isInteger(quizId) && quizId > 0;

    const { loading, error, data: queryData } = useQuery(getLeaderboardForQuiz, {
        variables: { quizId },
        skip: !hasValidQuizId,
    });

    const {
        data: subscriptionData,
        error: subscriptionError,
    } = useSubscription(leaderboardUpdated, {
        variables: { quizId },
        skip: !hasValidQuizId,
    });

    const leaderboardRows = useMemo<LeaderboardRow[]>(
        () => subscriptionData?.leaderboardUpdated ?? queryData?.getLeaderboardForQuiz ?? [],
        [subscriptionData, queryData]
    );

    const sortedRows = useMemo(
        () =>
            [...leaderboardRows].sort((a, b) => {
                if (a.rank !== b.rank) {
                    return a.rank - b.rank;
                }
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return a.name.localeCompare(b.name);
            }),
        [leaderboardRows]
    );

    const lastUpdated = useMemo(() => {
        if (!sortedRows.length) {
            return null;
        }

        const latestRow = [...sortedRows].sort(
            (a, b) => getSortableTime(b.updatedAt) - getSortableTime(a.updatedAt)
        )[0];

        return latestRow?.updatedAt ? new Date(String(latestRow.updatedAt)).toLocaleString() : null;
    }, [sortedRows]);

    if (!hasValidQuizId) {
        return <div style={{ padding: "24px" }}>Invalid quiz id.</div>;
    }

    if (loading) {
        return <div style={{ padding: "24px" }}>Loading leaderboard...</div>;
    }

    if (error) {
        return <div style={{ padding: "24px" }}>Error loading leaderboard: {error.message}</div>;
    }

    return (
        <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h1 style={{ margin: 0 }}>Live Leaderboard</h1>
                <button
                    onClick={() => router.push("/quiz/join")}
                    style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#64748b",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Back to quizzes
                </button>
            </div>

            <p style={{ marginBottom: "8px" }}>Quiz ID: {quizId}</p>
            <p style={{ marginBottom: "16px" }}>
                Last updated: {lastUpdated ?? "Waiting for updates"}
            </p>

            {subscriptionError ? (
                <p style={{ marginBottom: "16px", color: "#b45309" }}>
                    Realtime updates are currently unavailable. Showing latest loaded leaderboard snapshot.
                </p>
            ) : null}

            {!sortedRows.length ? (
                <p>No leaderboard entries yet.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Rank</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Name</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Score</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Correct</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Answered</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #d1d5db", padding: "10px" }}>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.map((row, index) => (
                                <tr key={`${row.userId ?? row.name}-${index}`}>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>{row.rank}</td>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>{row.name}</td>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>{row.score.toFixed(2)}</td>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>{row.correctCount}</td>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>{row.answeredCount}</td>
                                    <td style={{ borderBottom: "1px solid #e5e7eb", padding: "10px" }}>
                                        {new Date(String(row.updatedAt)).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
