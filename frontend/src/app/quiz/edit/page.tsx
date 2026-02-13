'use client'

import { getQuizzes } from "@/graphql/queries";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

export default function EditQuizListPage() {
    const router = useRouter();
    const { loading, error, data } = useQuery(getQuizzes);
    
    const handleQuizClick = (quizId: number) => {
        router.push(`/quiz/edit/${quizId}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Select a Quiz to Edit</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
                {data?.getAllQuizzes.map(({ id, title}) => (
                    <div 
                        key={id}
                        style={{
                            padding: '15px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: '#f9f9f9',
                            transition: 'background-color 0.2s'
                        }}
                        onClick={() => handleQuizClick(id!)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9e9e9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    >
                        <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
}
