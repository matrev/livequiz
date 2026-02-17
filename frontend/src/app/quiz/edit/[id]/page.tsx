'use client'

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Question, QuestionInput as QuestionInputType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz } from "@/graphql/queries";
import { updateQuestion } from "@/graphql/mutations";
import QuestionEditCard from "@/components/QuestionEditCard";

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const joinCode = params.id as string;

    const [editingById, setEditingById] = useState<Record<number, boolean>>({});
    const [draftById, setDraftById] = useState<Record<number, QuestionInputType>>({});
    const [savingById, setSavingById] = useState<Record<number, boolean>>({});

    const [questionSuccessMessage, setQuestionSuccessMessage] = useState<Record<number,string>>({});
    const [questionErrorMessage, setQuestionErrorMessage] = useState<Record<number, string>>({});
    const successTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
    const { loading, error, data } = useQuery(getQuiz, {
        variables: { joinCode }
    });

    const [updateQuestionMutation] = useMutation(updateQuestion);

    useEffect(() => {
        const timeoutMap = successTimeoutsRef.current;

        return () => {
            Object.values(timeoutMap).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
        };
    }, []);

    const handleEditToggle = (questionId: number) => {
        const question = data?.getQuiz?.questions?.find((q) => q.id === questionId);
        if (!question) return;

        setEditingById(prev => {
            const nextIsEditing = !prev[questionId];

            if (nextIsEditing) {
                setDraftById(draftPrev => ({
                    ...draftPrev,
                    [questionId]: draftPrev[questionId] ?? {
                        text: question.text,
                        correctAnswer: question.correctAnswer || '',
                        questionType: question.questionType,
                        options: question.options || []
                    }
                }));

                setQuestionSuccessMessage(successPrev => ({
                    ...successPrev,
                    [questionId]: ""
                }));
            }

            setQuestionErrorMessage(errorPrev => ({
                ...errorPrev,
                [questionId]: ""
            }));

            return {
                ...prev,
                [questionId]: nextIsEditing
            };
        });
    };

    const handleQuestionChange = (questionId: number, updatedQuestion: QuestionInputType) => {
        setDraftById(prev => ({
            ...prev,
            [questionId]: updatedQuestion
        }));

        setQuestionErrorMessage(prev => ({
            ...prev,
            [questionId]: ""
        }));
    };

    const handleSaveQuestion = async (questionId: number) => {
        const questionDraft = draftById[questionId];
        if (!questionDraft) return;

        setSavingById(prev => ({
            ...prev,
            [questionId]: true
        }));

        setQuestionErrorMessage(prev => ({
            ...prev,
            [questionId]: ""
        }));

        try {
            await updateQuestionMutation({
                variables: {
                    id: questionId,
                    text: questionDraft.text,
                    correctAnswer: questionDraft.correctAnswer,
                    questionType: questionDraft.questionType,
                    options: questionDraft.options
                },
                update: (cache, { data: mutationData }) => {
                    if (!mutationData?.updateQuestion) return

                    cache.modify({
                        id: cache.identify(mutationData.updateQuestion),
                        fields: {
                            text: () => mutationData.updateQuestion.text,
                            correctAnswer: () => mutationData.updateQuestion.correctAnswer,
                            questionType: () => mutationData.updateQuestion.questionType,
                            options: () => mutationData.updateQuestion.options,
                        }
                    });
                }
            });

            setEditingById((prev) => ({
                ...prev,
                [questionId]: false
            }));

            setQuestionSuccessMessage(prev => ({
                ...prev,
                [questionId]: "Question updated successfully!"
            }));

            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: ""
            }));

            if (successTimeoutsRef.current[questionId]) {
                clearTimeout(successTimeoutsRef.current[questionId]);
            }
            successTimeoutsRef.current[questionId] = setTimeout(() => {
                setQuestionSuccessMessage(prev => ({
                    ...prev,
                    [questionId]: ""
                }));
            }, 3000);
        } catch (err) {
            console.error("Error updating question:", err);
            setEditingById(prev => ({
                ...prev,
                [questionId]: true
            }));

            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: "Unable to update question. Please try again."
            }));
        } finally {
            setSavingById(prev => ({
                ...prev,
                [questionId]: false
            }));
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading quiz...</div>;
    if (error) return <div style={{ padding: '20px' }}>Error loading quiz: {error.message}</div>;
    if (!data?.getQuiz) return <div style={{ padding: '20px' }}>Quiz not found</div>;

    const quiz = data.getQuiz;
    const questionsWithId = (quiz.questions ?? []).filter(
        (question): question is Omit<Question, 'quizId'> & { id: number } => question.id != null
    );

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Edit Quiz: {quiz.title}</h1>
                <button
                    onClick={() => router.push('/quiz/edit')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to List
                </button>
            </div>

            {questionsWithId.length === 0 ? (
                <p>No questions found for this quiz.</p>
            ) : (
                questionsWithId.map((q, index: number) => {
                    const isEditing = editingById[q.id] || false;
                    const isSaving = savingById[q.id] || false;
                    const questionDraft = draftById[q.id] ?? {
                        text: q.text,
                        correctAnswer: q.correctAnswer || '',
                        questionType: q.questionType,
                        options: q.options || []
                    };
                    
                    return (
                        <QuestionEditCard
                            key={q.id}
                            question={q}
                            index={index}
                            isEditing={isEditing}
                            isSaving={isSaving}
                            questionDraft={questionDraft}
                            questionErrorMessage={questionErrorMessage[q.id] || ""}
                            questionSuccessMessage={questionSuccessMessage[q.id] || ""}
                            onSave={handleSaveQuestion}
                            onToggleEdit={handleEditToggle}
                            onChange={handleQuestionChange}
                        />
                    );
                })
            )}
        </div>
    );
}
