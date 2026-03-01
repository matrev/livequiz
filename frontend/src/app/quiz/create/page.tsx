'use client'

import { MutationCreateQuizArgs, QuestionInput, QuestionType, Quiz } from "@/generated/types";
import { LiveQuizError } from "@/utils/error";
import { validateQuizInput } from "@/utils/utils";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { createQuiz as createQuizMutation, createUser as createUserMutation } from "@/graphql/mutations";
import { getUserByEmail as getUserByEmailQuery } from "@/graphql/queries";
import QuestionInputComponent from "@/components/QuestionInput";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { quizTheme } from "../theme";

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
            {
                questionType: QuestionType.MultipleChoice,
                options: ["Option 1", "Option 2"],
                text: "",
            } as QuestionInput
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
        <div className={quizTheme.shell}>
            <div className={quizTheme.page}>
                <div className={quizTheme.header}>
                    <div>
                        <h1 className={quizTheme.title}>Create New Quiz</h1>
                        <p className={quizTheme.subtitle}>Set up your quiz details, then add questions.</p>
                    </div>
                    <Link href="/" className={quizTheme.buttonOutline}>
                        Back to Home
                    </Link>
                </div>

                {errorMessage && <div className={quizTheme.noticeError}>{errorMessage}</div>}

                {successMessage && (
                    <div className={quizTheme.noticeSuccess}>
                        {successMessage} {data?.joinCode}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`${quizTheme.panel} space-y-5`}>
                        <div>
                            <label htmlFor="QuizTitle" className={quizTheme.label}>
                                Quiz Title
                            </label>
                            <input
                                type="text"
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                name="QuizTitle"
                                id="QuizTitle"
                                className={quizTheme.input}
                                placeholder="Enter quiz title"
                            />
                        </div>

                        <div>
                            <label htmlFor="OwnerName" className={quizTheme.label}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                onChange={(e) => setOwnerName(e.target.value)}
                                value={ownerName}
                                name="OwnerName"
                                id="OwnerName"
                                className={quizTheme.input}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="OwnerEmail" className={quizTheme.label}>
                                Your Email
                            </label>
                            <input
                                type="email"
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                value={ownerEmail}
                                name="OwnerEmail"
                                id="OwnerEmail"
                                className={quizTheme.input}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="QuizDeadline" className={quizTheme.label}>
                                Deadline for Responses (optional)
                            </label>
                            <input
                                type="datetime-local"
                                onChange={(e) => setDeadline(e.target.value)}
                                value={deadline}
                                name="QuizDeadline"
                                id="QuizDeadline"
                                className={quizTheme.input}
                            />
                        </div>
                    </div>

                    <div className={`${quizTheme.panel} space-y-4`}>
                        <h2 className={quizTheme.sectionTitle}>Questions</h2>
                        {questions.length === 0 ? (
                            <p className={quizTheme.mutedText}>
                                No questions added yet. Click &quot;Add Question&quot; to get started.
                            </p>
                        ) : (
                            questions.map((question, index) => (
                                <div key={index} className={`${quizTheme.itemCard} space-y-3`}>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-lg font-semibold text-white">Question {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className={quizTheme.buttonDanger}
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

                    <div className={quizTheme.inlineActions}>
                        <button type="button" onClick={addQuestion} className={quizTheme.buttonOutline}>
                            Add Question
                        </button>
                        <button type="submit" disabled={loading} className={quizTheme.buttonPrimary}>
                            {loading ? 'Creating...' : 'Create Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}