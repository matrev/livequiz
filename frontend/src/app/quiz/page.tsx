// pull quiz data from the server and display it
'use client'

// use the generated types for your query
import { useQuery } from "@apollo/client/react";
import { getQuizzes } from "@/graphql/queries";

export default function Home() {
    const { loading, error, data } = useQuery(getQuizzes);
    console.log('data', data);
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error : {error.message}</p>}
            {data?.getAllQuizzes.map(({ id, title }) => (
                <div key={id}>
                    <h3>Quiz Title: {title}</h3>
                </div>
            ))}
        </div>
    );
}