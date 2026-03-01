// pull quiz data from the server and display it
'use client'

// use the generated types for your query
import { useQuery } from "@apollo/client/react";
import { getQuizzes } from "@/graphql/queries";
import { quizTheme } from "./theme";

export default function Home() {
    const { loading, error, data } = useQuery(getQuizzes);

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
                <div className={quizTheme.header}>
                    <h1 className={quizTheme.title}>All Quizzes</h1>
                </div>

                {loading && <p className={quizTheme.mutedText}>Loading...</p>}
                {error && <p className={quizTheme.noticeError}>Error : {error.message}</p>}

                <div className="grid gap-4">
                    {data?.getAllQuizzes.map(({ id, title }) => (
                        <div key={id} className={quizTheme.itemCard}>
                            <h3 className="text-lg font-semibold text-white">Quiz Title: {title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}