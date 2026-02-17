'use client'

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { QuestionType, Question, QuestionInput as QuestionInputType } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz } from "@/graphql/queries";
import { updateQuestion } from "@/graphql/mutations";
import QuestionInput from "@/components/QuestionInput";
import QuestionEditor from "@/components/QuestionEditor";

interface EditableQuestion extends Omit<Question, 'quizId'> {
    isEditing?: boolean;
    editedQuestion?: QuestionInputType;
}

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const joinCode = params.id as string;
    
    const [editingStates, setEditingStates] = useState<{[key: number]: {
        isEditing: boolean, 
        editedQuestion: QuestionInputType
    }}>({});
    const [successMessage, setSuccessMessage] = useState<string>("");

    const { loading, error, data } = useQuery(getQuiz, {
        variables: { joinCode }
    });

    const [updateQuestionMutation, { loading: updateLoading }] = useMutation(updateQuestion, {
        onCompleted: () => {
            setSuccessMessage("Question updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        },
        onError: (error) => {
            alert(`Error updating question: ${error.message}`);
        }
    });

    const handleEditToggle = (questionId: number) => {
        const question = data?.getQuiz?.questions?.find((q) => q.id === questionId);
        if (!question) return;
        
        setEditingStates(prev => ({
            ...prev,
            [questionId]: {
                isEditing: !prev[questionId]?.isEditing,
                editedQuestion: prev[questionId]?.editedQuestion ?? {
                    text: question.text,
                    correctAnswer: question.correctAnswer || '',
                    questionType: question.questionType,
                    options: question.options || []
                }
            }
        }));
    };

    const handleQuestionChange = (questionId: number, updatedQuestion: QuestionInputType) => {
        setEditingStates(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                editedQuestion: updatedQuestion
            }
        }));
    };

    const handleSaveQuestion = async (questionId: number) => {
        const editState = editingStates[questionId];
        if (!editState) return;

        // Optimistically update UI before mutation
        setEditingStates(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], isEditing: false }
        }));

        try {
            await updateQuestionMutation({
                variables: {
                    id: questionId,
                    text: editState.editedQuestion.text,
                    correctAnswer: editState.editedQuestion.correctAnswer,
                    questionType: editState.editedQuestion.questionType,
                    options: editState.editedQuestion.options
                },
                optimisticResponse: {
                    updateQuestion: {
                        __typename: 'Question',
                        id: questionId,
                        text: editState.editedQuestion.text,
                        correctAnswer: editState.editedQuestion.correctAnswer,
                        questionType: editState.editedQuestion.questionType,
                        options: editState.editedQuestion.options
                    }
                },
                update: (cache, { data: mutationData }) => {
                    if (mutationData?.updateQuestion) {
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
                }
            });
        } catch (err) {
            console.error("Error updating question:", err);
            // Revert editing state on error
            setEditingStates(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], isEditing: true }
            }));
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading quiz...</div>;
    if (error) return <div style={{ padding: '20px' }}>Error loading quiz: {error.message}</div>;
    if (!data?.getQuiz) return <div style={{ padding: '20px' }}>Quiz not found</div>;

    const quiz = data.getQuiz;

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

            {successMessage && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    {successMessage}
                </div>
            )}

            {!quiz.questions || quiz.questions.length === 0 ? (
                <p>No questions found for this quiz.</p>
            ) : (
                (quiz.questions as Omit<Question, 'quizId'>[]).map((q: Omit<Question, 'quizId'>, index: number) => {
                    if (!q.id) return null;
                    const editState = editingStates[q.id];
                    const isEditing = editState?.isEditing || false;
                    
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveQuestion(q.id!)}
                                                disabled={updateLoading}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: updateLoading ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {updateLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => handleEditToggle(q.id!)}
                                                disabled={updateLoading}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: updateLoading ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEditToggle(q.id!)}
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
                                    question={editState.editedQuestion!}
                                    index={index}
                                    onChange={(updated) => handleQuestionChange(q.id!, updated)}
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
