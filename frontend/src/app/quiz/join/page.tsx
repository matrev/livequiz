'use client'

import { getQuiz } from "@/graphql/queries";
import { useLazyQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { quizTheme } from "../theme";

export default function JoinPage() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const [fetchQuiz, { loading }] = useLazyQuery(getQuiz);

    const handleJoin = async () => {
        const trimmed = joinCode.trim();
        if (!trimmed) {
            setFormError("Please enter a join code.");
            return;
        }
        try {
            const result = await fetchQuiz({ variables: { joinCode: trimmed } });
            if (!result.data?.getQuiz) {
                setFormError("Quiz not found. Check the join code and try again.");
                return;
            }

            // Check if quiz deadline has passed
            const quiz = result.data.getQuiz;
            if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
                setFormError(null);
                router.push(`/quiz/leaderboard/${quiz.joinCode}`);
                return;
            }

            setFormError(null);
            router.push(`/quiz/join/${trimmed}`);
        } catch {
            setFormError("Unable to join the quiz right now.");
        }
    };

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
                <div className={quizTheme.header}>
                    <div>
                        <h1 className={quizTheme.title}>Join a Quiz</h1>
                        <p className={quizTheme.subtitle}>Enter the quiz join code to continue.</p>
                    </div>
                    <Link href="/" className={`${quizTheme.buttonOutline} w-full sm:w-auto`}>
                        Back to Home
                    </Link>
                </div>

                <div className={`${quizTheme.panel} w-full max-w-xl`}>
                    <label htmlFor="JoinCode" className={quizTheme.label}>
                        Join Code
                    </label>
                    <input
                        type="text"
                        id="JoinCode"
                        name="JoinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className={quizTheme.input}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center mb-4">
                        <button
                            type="button"
                            onClick={handleJoin}
                            disabled={loading}
                            className={`${quizTheme.buttonPrimary} w-full sm:w-auto`}
                        >
                            {loading ? "Joining..." : "Join Quiz"}
                        </button>
                    </div>

                    {formError ? <p className={quizTheme.noticeError}>{formError}</p> : null}
                </div>
            </div>
        </div>
    );
}