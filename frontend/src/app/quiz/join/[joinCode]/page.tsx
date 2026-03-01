'use client'

import { useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { QuestionType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz, getUserByEmail } from "@/graphql/queries";
import { createUser, upsertEntry } from "@/graphql/mutations";
import { quizTheme } from "../../theme";

interface UserAnswers {
    [questionId: number]: string;
}

export default function JoinQuizPage() {
    const params = useParams();
    const router = useRouter();
    const joinCode = params.joinCode as string;
    
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

    if (loading) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Loading quiz...</div>;
    if (error) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Error loading quiz: {error.message}</div>;
    if (!data?.getQuiz) return <div className={`${quizTheme.shell} ${quizTheme.page}`}>Quiz not found</div>;

    const quiz = data.getQuiz;
    const allQuestionsAnswered = quiz.questions?.every((q) => 
        q.id !== null && q.id !== undefined && userAnswers[q.id] !== undefined && userAnswers[q.id] !== ''
    ) ?? false;
    const isSubmitDisabled = !allQuestionsAnswered || !username.trim() || savingEntry || savingUser || checkingUser;

    if (submitted) {
        return (
            <div className={quizTheme.shell}>
                <div className={quizTheme.page}>
                    <div className={`${quizTheme.panel} max-w-2xl space-y-4`}>
                        <h1 className={quizTheme.title}>Thank you for completing the quiz!</h1>
                        <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
                        <p className={quizTheme.mutedText}>Your answers have been submitted.</p>
                        <button onClick={() => router.push('/quiz/join')} className={quizTheme.buttonPrimary}>
                            Back to Quiz List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
            <h1 className={quizTheme.title}>{quiz.title}</h1>
            <p className={`mb-6 mt-2 ${quizTheme.mutedText}`}>Please answer all questions below:</p>

            <div className={`${quizTheme.panel} mb-6 space-y-4`}>
                <label className="block">
                    <span className={quizTheme.label}>Username *</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className={quizTheme.input}
                    />
                </label>

                <label className="block">
                    <span className={quizTheme.label}>Email (optional)</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={quizTheme.input}
                    />
                </label>
            </div>

            {quiz.questions?.map((question) => {
                if (!question.id) return null;
                
                return (
                    <div key={question.id} className={`${quizTheme.itemCard} mb-5`}>
                        <p className="mb-4 text-lg font-medium text-white">{question.text}</p>

                        {question.questionType === QuestionType.MultipleChoice && question.options ? (
                            <div className="space-y-2">
                                {question.options.map((option: string | null, optIndex: number) => (
                                    <label 
                                        key={optIndex}
                                        className={quizTheme.radioLabel}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option ?? ''}
                                            checked={userAnswers[question.id!] === option}
                                            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                            className="size-4 accent-cyan-300"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        ) : question.questionType === QuestionType.TrueFalse ? (
                            <div className="space-y-2">
                                <label className={quizTheme.radioLabel}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="True"
                                        checked={userAnswers[question.id!] === 'True'}
                                        onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                        className="size-4 accent-cyan-300"
                                    />
                                    True
                                </label>
                                <label className={quizTheme.radioLabel}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="False"
                                        checked={userAnswers[question.id!] === 'False'}
                                        onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                                        className="size-4 accent-cyan-300"
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
                                className={quizTheme.input}
                            />
                        )}
                    </div>
                );
            })}

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={quizTheme.buttonPrimary}
                >
                    {savingEntry || savingUser || checkingUser ? 'Submitting...' : 'Submit Quiz'}
                </button>
                <button
                    onClick={() => router.push('/quiz/join')}
                    className={quizTheme.buttonOutline}
                >
                    Cancel
                </button>
            </div>
            {submitError ? (
                <p className={`${quizTheme.noticeError} mt-3`}>{submitError}</p>
            ) : null}
            </div>
        </div>
    );
}
