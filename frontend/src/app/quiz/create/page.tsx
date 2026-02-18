'use client'

import { MutationCreateQuizArgs, QuestionInput, Quiz } from "@/generated/types";
import { LiveQuizError } from "@/utils/error";
import { validateQuizInput } from "@/utils/utils";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { createQuiz as createQuizMutation, createUser as createUserMutation } from "@/graphql/mutations";
import { getUserByEmail as getUserByEmailQuery } from "@/graphql/queries";
import QuestionInputComponent from "@/components/QuestionInput";

import Link from "next/link";
import { SubmitEvent, useState } from "react";

export default function CreateQuizPage() {
    const [createQuiz, { data, loading }] = useMutation<Quiz,MutationCreateQuizArgs>(createQuizMutation, {
        variables: {
            title: "placeholder",
            questions: [],
            userId: 0,
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
    const [createUser] = useMutation(createUserMutation);
    const [getUserByEmail] = useLazyQuery(getUserByEmailQuery, {
        fetchPolicy: "network-only",
    });
    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [title, setTitle] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [ownerName, setOwnerName] = useState<string>("");
    const [ownerEmail, setOwnerEmail] = useState<string>("");
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

    const removeQuestion = (index: number) => {
        const shouldRemove = window.confirm("Remove this question?");
        if (!shouldRemove) {
            return;
        }

        setQuestions(prev => prev.filter((_, i) => i !== index));
    }

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const trimmedOwnerName = ownerName.trim();
            const trimmedOwnerEmail = ownerEmail.trim().toLowerCase();

            validateQuizInput({
                title,
                questions,
                userId: 0,
                name: trimmedOwnerName, // user creation field
                email: trimmedOwnerEmail, // user creation field
            });

            const existingUserResult = await getUserByEmail({
                variables: {
                    email: trimmedOwnerEmail,
                },
            });

            if (existingUserResult.data?.getUserByEmail?.id) {
                throw new LiveQuizError("An account with this email already exists.");
            }

            const createdUserResult = await createUser({
                variables: {
                    name: trimmedOwnerName,
                    email: trimmedOwnerEmail,
                    isAdmin: false,
                },
            });

            const ownerId = createdUserResult.data?.createUser.id;
            if (!ownerId) {
                throw new LiveQuizError("Unable to create user for this quiz.");
            }

            const deadlineIso = deadline ? new Date(deadline).toISOString() : undefined;
            await createQuiz({ variables: { title: title, questions: questions, deadline: deadlineIso, userId: ownerId }});
        } catch (error) {
            if (error instanceof LiveQuizError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Failed to create quiz. Please try again.");
            }
            return;
        }
        setTitle("");
        setOwnerName("");
        setOwnerEmail("");
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

                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="OwnerName" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Your Name:
                        </label>
                        <input
                            type="text"
                            onChange={(e) => setOwnerName(e.target.value)}
                            value={ownerName}
                            name="OwnerName"
                            id="OwnerName"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="OwnerEmail" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Your Email:
                        </label>
                        <input
                            type="email"
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            value={ownerEmail}
                            name="OwnerEmail"
                            id="OwnerEmail"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your email"
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
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