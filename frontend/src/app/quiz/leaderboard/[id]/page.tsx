'use client'

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useSubscription } from "@apollo/client/react";
import { getLeaderboardForQuiz } from "@/graphql/queries";
import { leaderboardUpdated } from "@/graphql/subscriptions";
import { GetLeaderboardForQuizQuery } from "@/generated/types";
import { quizTheme } from "../../theme";

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
        return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Invalid quiz id.</div>;
    }

    if (loading) {
        return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Loading leaderboard...</div>;
    }

    if (error) {
        return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Error loading leaderboard: {error.message}</div>;
    }

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
            <div className={quizTheme.header}>
                <h1 className={quizTheme.title}>Live Leaderboard</h1>
                <button
                    onClick={() => router.push("/quiz/join")}
                    className={`${quizTheme.buttonOutline} w-full sm:w-auto`}
                >
                    Back to quizzes
                </button>
            </div>

            <p className="mb-1 text-sm text-white/80 sm:text-base">Quiz ID: {quizId}</p>
            <p className="mb-4 text-sm text-white/65">
                Last updated: {lastUpdated ?? "Waiting for updates"}
            </p>

            {subscriptionError ? (
                <p className={quizTheme.noticeError}>
                    Realtime updates are currently unavailable. Showing latest loaded leaderboard snapshot.
                </p>
            ) : null}

            {!sortedRows.length ? (
                <p className={quizTheme.mutedText}>No leaderboard entries yet.</p>
            ) : (
                <div className="-mx-4 sm:mx-0">
                    <div className={quizTheme.tableWrap}>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className={quizTheme.tableHeader}>Rank</th>
                                <th className={quizTheme.tableHeader}>Name</th>
                                <th className={quizTheme.tableHeader}>Score</th>
                                <th className={quizTheme.tableHeader}>Correct</th>
                                <th className={quizTheme.tableHeader}>Answered</th>
                                <th className={quizTheme.tableHeader}>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.map((row, index) => (
                                <tr key={`${row.userId ?? row.name}-${index}`}>
                                    <td className={quizTheme.tableCell}>{row.rank}</td>
                                    <td className={quizTheme.tableCell}>{row.name}</td>
                                    <td className={quizTheme.tableCell}>{row.score.toFixed(2)}</td>
                                    <td className={quizTheme.tableCell}>{row.correctCount}</td>
                                    <td className={quizTheme.tableCell}>{row.answeredCount}</td>
                                    <td className={quizTheme.tableCell}>
                                        {new Date(String(row.updatedAt)).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
