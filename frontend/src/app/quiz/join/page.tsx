'use client'

import { getQuizzes } from "@/graphql/queries";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const { loading, error, data } = useQuery(getQuizzes);
    
    const handleQuizClick = (quizId: number) => {
        router.push(`/quiz/join/${quizId}`);
    };

    console.log('data', data);
    return (
        <div>
            <h1>Please select a quiz you would like to join</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error : {error.message}</p>}
            {data?.getAllQuizzes.map(({ id, title}) => (
                <div key={id}>
                    <h2>Quiz Title: </h2>
                    <button onClick={() => handleQuizClick(id!)}>{title}</button>
                </div>
            ))}
        </div>
    );
}