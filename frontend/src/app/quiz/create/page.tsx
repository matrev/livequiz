'use client'

import { MutationCreateQuizArgs, QuestionInput, Quiz } from "@/generated/types";
import { LiveQuizError } from "@/utils/error";
import { validateQuizInput } from "@/utils/utils";
import { useMutation } from "@apollo/client/react";
import { createQuiz as createQuizMutation } from "@/graphql/mutations";
import QuestionInputComponent from "@/components/QuestionInput";

import Link from "next/link";
import { SubmitEvent, useState } from "react";

export default function CreateQuizPage() {
    const [createQuiz, { data, loading, error }] = useMutation<Quiz,MutationCreateQuizArgs>(createQuizMutation, {
        variables: {
            title: "placeholder",
            questions: [],
            userId: 9,
        },
        onCompleted: () => {
            setSuccessMessage("Quiz created successfully.");
            setErrorMessage(null);
        },
        onError: () => {
            setErrorMessage("Failed to create quiz. Please try again.");
            setSuccessMessage(null);
        }
    });
    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [title, setTitle] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {} as QuestionInput
        ]);
    }

    const updateQuestion = (index: number, updatedQuestion: QuestionInput) => {
        setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            validateQuizInput({title, questions, userId: 9})
            const deadlineIso = deadline ? new Date(deadline).toISOString() : undefined;
            createQuiz({ variables: { title: title, questions: questions, deadline: deadlineIso, userId: 9 }});
        } catch (error) {
            if (error instanceof LiveQuizError) {
                setErrorMessage(error.message);
            }
            return;
        }
        setTitle("");
        setErrorMessage(null);
        setQuestions([]);
        setDeadline("");
    }

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Create New Quiz</h1>
                <Link href="/" style={{
                    padding: '10px 20px',
                    backgroundColor: '#666',
                    color: 'white',
                    textDecoration: 'none',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Back to Home
                </Link>
            </div>

            {errorMessage && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px'
                }}>
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    {successMessage} {data?.joinCode}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{
                    marginBottom: '20px',
                    padding: '20px',
                    border: '2px solid #ddd',
                    borderRadius: '8px'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="QuizTitle" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Quiz Title:
                        </label>
                        <input
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            name="QuizTitle"
                            id="QuizTitle"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter quiz title"
                        />
                    </div>

                    <div style={{ marginBottom: '0' }}>
                        <label htmlFor="QuizDeadline" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Deadline for Responses (optional):
                        </label>
                        <input
                            type="datetime-local"
                            onChange={(e) => setDeadline(e.target.value)}
                            value={deadline}
                            name="QuizDeadline"
                            id="QuizDeadline"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Questions</h2>
                    {questions.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
                    ) : (
                        questions.map((question, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '20px',
                                    padding: '20px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px'
                                }}
                            >
                                <h3 style={{ margin: '0 0 15px 0' }}>Question {index + 1}</h3>
                                <QuestionInputComponent
                                    question={question}
                                    index={index}
                                    onChange={(updated) => updateQuestion(index, updated)}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={addQuestion}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Add Question
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: loading ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
}