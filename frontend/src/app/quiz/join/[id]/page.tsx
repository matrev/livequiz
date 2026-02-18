'use client'

import { useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { QuestionType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz, getUserByEmail } from "@/graphql/queries";
import { createUser, upsertEntry } from "@/graphql/mutations";

interface UserAnswers {
    [questionId: number]: string;
}

export default function JoinQuizPage() {
    const params = useParams();
    const router = useRouter();
    const joinCode = params.id as string;
    
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [upsertEntryMutation, { loading: savingEntry }] = useMutation(upsertEntry);
    const [createUserMutation, { loading: savingUser }] = useMutation(createUser);
    const [getUserByEmailQuery, { loading: checkingUser }] = useLazyQuery(getUserByEmail, {
        fetchPolicy: 'no-cache',
    });

    const { loading, error, data } = useQuery(getQuiz, {
        variables: { joinCode },
    });

    const handleAnswerChange = (questionId: number, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const getExistingUserByEmail = async (normalizedEmail: string) => {
        const result = await getUserByEmailQuery({
            variables: { email: normalizedEmail },
        });
        return result.data?.getUserByEmail ?? null;
    };

    const handleSubmit = async () => {
        if (!data?.getQuiz?.id) {
            return;
        }

        const trimmedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!trimmedUsername) {
            setSubmitError("Please enter your username.");
            return;
        }

        const quizId = data.getQuiz.id;
        try {
            setSubmitError(null);

            let resolvedUserId: number | undefined;

            if (normalizedEmail) {
                const existingUser = await getExistingUserByEmail(normalizedEmail);

                if (existingUser) {
                    const confirmed = window.confirm(
                        `An account with ${normalizedEmail} already exists. Responses for this quiz will be sent to this email address. Do you want to continue?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    if (existingUser.id == null) {
                        throw new Error("Existing user is missing an id.");
                    }

                    resolvedUserId = existingUser.id;
                } else {
                    try {
                        const createdUser = await createUserMutation({
                            variables: {
                                email: normalizedEmail,
                                name: trimmedUsername,
                            },
                        });
                        const createdUserId = createdUser.data?.createUser.id;
                        if (createdUserId == null) {
                            throw new Error("Created user is missing an id.");
                        }
                        resolvedUserId = createdUserId;
                    } catch {
                        const fallbackUser = await getExistingUserByEmail(normalizedEmail);
                        if (!fallbackUser || fallbackUser.id == null) {
                            throw new Error("Unable to resolve user for provided email.");
                        }
                        resolvedUserId = fallbackUser.id;
                    }
                }
            }

            await upsertEntryMutation({
                variables: {
                    quizId,
                    userId: resolvedUserId,
                    name: trimmedUsername,
                    answers: Object.fromEntries(
                        Object.entries(userAnswers).map(([key, value]) => [String(key), value])
                    ),
                },
            });
            setSubmitted(true);
        } catch {
            setSubmitError("Unable to submit your answers. Please try again.");
        }
    };

    if (loading) return <div>Loading quiz...</div>;
    if (error) return <div>Error loading quiz: {error.message}</div>;
    if (!data?.getQuiz) return <div>Quiz not found</div>;

    const quiz = data.getQuiz;
    const allQuestionsAnswered = quiz.questions?.every((q) => 
        q.id !== null && q.id !== undefined && userAnswers[q.id] !== undefined && userAnswers[q.id] !== ''
    ) ?? false;
    const isSubmitDisabled = !allQuestionsAnswered || !username.trim() || savingEntry || savingUser || checkingUser;

    if (submitted) {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Thank you for completing the quiz!</h1>
                <h2>{quiz.title}</h2>
                <p>Your answers have been submitted.</p>
                <button onClick={() => router.push('/quiz/join')}>
                    Back to Quiz List
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '32px' }}>{quiz.title}</h1>
            <p>Please answer all questions below:</p>

            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '12px' }}>
                    <span style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Username *</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    />
                </label>

                <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email (optional)</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    />
                </label>
            </div>

            {quiz.questions?.map((question) => {
                if (!question.id) return null;
                
                return (
                    <div key={question.id} style={{ 
                        marginBottom: '30px', 
                        padding: '20px', 
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                    }}>
                        <p style={{ fontSize: '18px', marginBottom: '15px' }}>{question.text}</p>

                        {question.questionType === QuestionType.MultipleChoice && question.options ? (
                            <div>
                                {question.options.map((option: string | null, optIndex: number) => (
                                    <label 
                                        key={optIndex}
                                        style={{ 
                                            display: 'block', 
                                            marginBottom: '10px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option ?? ''}
                                            checked={userAnswers[question.id!] === option}
                                            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        ) : question.questionType === QuestionType.TrueFalse ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="True"
                                        checked={userAnswers[question.id!] === 'True'}
                                        onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    True
                                </label>
                                <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="False"
                                        checked={userAnswers[question.id!] === 'False'}
                                        onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    False
                                </label>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={userAnswers[question.id!] || ''}
                                onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                placeholder="Enter your answer"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px',
                                    fontSize: '16px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        )}
                    </div>
                );
            })}

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: !isSubmitDisabled ? '#0070f3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isSubmitDisabled ? 'pointer' : 'not-allowed'
                    }}
                >
                    {savingEntry || savingUser || checkingUser ? 'Submitting...' : 'Submit Quiz'}
                </button>
                <button
                    onClick={() => router.push('/quiz/join')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
            {submitError ? (
                <p style={{ marginTop: '12px', color: '#b91c1c' }}>{submitError}</p>
            ) : null}
        </div>
    );
}
