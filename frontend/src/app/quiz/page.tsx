// pull quiz data from the server and display it
'use client'

import { GetQuizzesQueryVariables, GetQuizzesQuery } from "@/generated/types";
import { gql, TypedDocumentNode } from "@apollo/client";

// use the generated types for your query
import { useQuery } from "@apollo/client/react";

const getQuizzes: TypedDocumentNode<GetQuizzesQuery, GetQuizzesQueryVariables> = gql`
    query GetQuizzes {
        getAllQuizzes {
            id
            title
        }
    }
`

export default function Home() {
  const { loading, error, data } = useQuery(getQuizzes);
    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error : {error.message}</p>}
            {data?.getAllQuizzes.map(({ id, title }) => (
                <div key={id}>
                    <h3>{title}</h3>
                </div>
            ))}
        </div>
    );
}