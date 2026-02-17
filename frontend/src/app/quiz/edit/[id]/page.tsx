'use client'

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { QuestionType, Question, QuestionInput as QuestionInputType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz } from "@/graphql/queries";
import { updateQuestion } from "@/graphql/mutations";
import QuestionEditor from "@/components/QuestionEditor";

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

        const nextIsEditing = !editingById[questionId];

        setEditingById(prev => ({
            ...prev,
            [questionId]: nextIsEditing
        }));

        if (nextIsEditing) {
            setDraftById(prev => ({
                ...prev,
                [questionId]: prev[questionId] ?? {
                    text: question.text,
                    correctAnswer: question.correctAnswer || '',
                    questionType: question.questionType,
                    options: question.options || []
                }
            }));

            setQuestionSuccessMessage(prev => ({
                ...prev,
                [questionId]: ""
            }));

            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: ""
            }));
        } else {
            setQuestionErrorMessage(prev => ({
                ...prev,
                [questionId]: ""
            }));
        }
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
                        <div 
                            key={q.id} 
                            style={{ 
                                marginBottom: '25px', 
                                padding: '20px', 
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                            }}
                        >
                            {questionErrorMessage[q.id] && (
                                <div style={{
                                    padding: '10px',
                                    marginBottom: '20px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    border: '1px solid #f5c6cb',
                                    borderRadius: '4px'
                                }}>
                                    {questionErrorMessage[q.id]}
                                </div>
                            )}
                            {questionSuccessMessage[q.id] && (
                                <div style={{
                                    padding: '10px',
                                    marginBottom: '20px',
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    border: '1px solid #c3e6cb',
                                    borderRadius: '4px'
                                }}>
                                    {questionSuccessMessage[q.id]}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveQuestion(q.id)}
                                                disabled={isSaving}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => handleEditToggle(q.id)}
                                                disabled={isSaving}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEditToggle(q.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <QuestionEditor
                                    question={questionDraft}
                                    index={index}
                                    onChange={(updated) => handleQuestionChange(q.id, updated)}
                                />
                            ) : (
                                <>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            Question Text:
                                        </label>
                                        <p style={{ 
                                            padding: '10px', 
                                            // backgroundColor: 'white', 
                                            borderRadius: '4px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {q.text}
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            Question Type:
                                        </label>
                                        <p style={{ 
                                            padding: '10px', 
                                            // backgroundColor: 'white', 
                                            borderRadius: '4px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {q.questionType}
                                        </p>
                                    </div>

                                    {q.questionType === QuestionType.MultipleChoice && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                                Options:
                                            </label>
                                            <ul style={{ 
                                                padding: '10px 10px 10px 30px', 
                                                // backgroundColor: 'white', 
                                                borderRadius: '4px',
                                                border: '1px solid #e0e0e0'
                                            }}>
                                                {q.options?.map((option: string | null, idx: number) => (
                                                    <li key={idx} style={{ marginBottom: '5px' }}>{option}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            Correct Answer:
                                        </label>
                                        <p style={{ 
                                            padding: '10px', 
                                            backgroundColor: q.correctAnswer ? '#e7f3ff' : '#fff3cd', 
                                            borderRadius: '4px',
                                            border: `1px solid ${q.correctAnswer ? '#b3d9ff' : '#ffc107'}`,
                                            fontWeight: 'bold',
                                            color: q.correctAnswer ? '#3178c6' : '#856404'
                                        }}>
                                            {q.correctAnswer || 'No correct answer set'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
