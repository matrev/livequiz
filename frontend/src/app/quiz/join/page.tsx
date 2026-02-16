'use client'

import { getQuiz } from "@/graphql/queries";
import { useLazyQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinPage() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const [fetchQuiz, { loading, data, error }] = useLazyQuery(getQuiz);

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
                router.push(`/quiz/leaderboard/${quiz.id}`);
                return;
            }

            setFormError(null);
            router.push(`/quiz/join/${trimmed}`);
        } catch {
            setFormError("Unable to join the quiz right now.");
        }
    };

    return (
        <div>
            <h1>Enter a join code to join a quiz</h1>
            <label htmlFor="JoinCode">Join Code</label>
            <input
                type="text"
                id="JoinCode"
                name="JoinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="button" onClick={handleJoin} disabled={loading}>
                {loading ? "Joining..." : "Join Quiz"}
            </button>
            {formError ? <p>{formError}</p> : null}
        </div>
    );
}