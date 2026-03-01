'use client'

import { getQuizzes } from "@/graphql/queries";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { quizTheme } from "../theme";

export default function EditQuizListPage() {
    const router = useRouter();
    const { loading, error, data } = useQuery(getQuizzes);
    
    const handleQuizClick = (joinCode: string) => {
        router.push(`/quiz/edit/${joinCode}`);
    };

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
            <h1 className={`${quizTheme.title} mb-6`}>Select a Quiz to Edit</h1>
            {loading && <p className={quizTheme.mutedText}>Loading...</p>}
            {error && <p className={quizTheme.noticeError}>Error: {error.message}</p>}
            <div className="flex max-w-3xl flex-col gap-3">
                {data?.getAllQuizzes.map(({ id, title, joinCode}) => (
                    <div 
                        key={id}
                        className={`${quizTheme.itemCard} cursor-pointer`}
                        onClick={() => handleQuizClick(joinCode)}
                    >
                        <h2 className="m-0 text-lg font-semibold text-white">{title}</h2>
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
