'use client'

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { QuestionType, Question } from "@/generated/types";
import { useParams, useRouter } from "next/navigation";
import { getQuiz } from "@/graphql/queries";
import { updateQuestion } from "@/graphql/mutations";

interface EditableQuestion extends Omit<Question, 'quizId'> {
    isEditing?: boolean;
    editedText?: string;
    editedCorrectAnswer?: string;
    editedQuestionType?: QuestionType;
    editedOptions?: (string | null)[];
}

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = parseInt(params.id as string);
    
    const [editingStates, setEditingStates] = useState<{[key: number]: {
        isEditing: boolean, 
        editedText: string, 
        editedCorrectAnswer: string,
        editedQuestionType: QuestionType,
        editedOptions: (string | null)[]
    }}>({});
    const [successMessage, setSuccessMessage] = useState<string>("");

    const { loading, error, data } = useQuery(getQuiz, {
        variables: { id: quizId }
    });

    const getEditableQuestion = (q: Omit<Question, 'quizId'>): EditableQuestion => {
        const editState = editingStates[q.id!];
        return {
            ...q,
            isEditing: editState?.isEditing || false,
            editedText: editState?.editedText ?? q.text,
            editedCorrectAnswer: editState?.editedCorrectAnswer ?? (q.correctAnswer || ''),
            editedQuestionType: editState?.editedQuestionType ?? q.questionType,
            editedOptions: editState?.editedOptions ?? (q.options || [])
        };
    };

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
                editedText: prev[questionId]?.editedText ?? question.text,
                editedCorrectAnswer: prev[questionId]?.editedCorrectAnswer ?? (question.correctAnswer || ''),
                editedQuestionType: prev[questionId]?.editedQuestionType ?? question.questionType,
                editedOptions: prev[questionId]?.editedOptions ?? (question.options || [])
            }
        }));
    };

    const handleTextChange = (questionId: number, newText: string) => {
        setEditingStates(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], editedText: newText }
        }));
    };

    const handleCorrectAnswerChange = (questionId: number, newAnswer: string) => {
        setEditingStates(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], editedCorrectAnswer: newAnswer }
        }));
    };

    const handleQuestionTypeChange = (questionId: number, newType: QuestionType) => {
        setEditingStates(prev => {
            const currentState = prev[questionId];
            let newOptions = currentState.editedOptions;
            let newAnswer = currentState.editedCorrectAnswer;
            
            // If switching to MULTIPLE_CHOICE and no options exist, create default options
            if (newType === QuestionType.MultipleChoice && (!newOptions || newOptions.length === 0)) {
                newOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
            }
            // If switching to TRUE_FALSE, clear options and reset answer
            else if (newType === QuestionType.TrueFalse) {
                newOptions = [];
                newAnswer = '';
            }
            // If switching to SHORT_ANSWER, clear options
            else if (newType === QuestionType.ShortAnswer) {
                newOptions = [];
            }
            
            return {
                ...prev,
                [questionId]: { 
                    ...currentState, 
                    editedQuestionType: newType,
                    editedOptions: newOptions,
                    editedCorrectAnswer: newAnswer
                }
            };
        });
    };

    const handleOptionChange = (questionId: number, optionIndex: number, newValue: string) => {
        setEditingStates(prev => {
            const currentState = prev[questionId];
            const newOptions = [...currentState.editedOptions];
            newOptions[optionIndex] = newValue;
            return {
                ...prev,
                [questionId]: { ...currentState, editedOptions: newOptions }
            };
        });
    };

    const handleAddOption = (questionId: number) => {
        setEditingStates(prev => {
            const currentState = prev[questionId];
            const newOptions = [...currentState.editedOptions, `Option ${currentState.editedOptions.length + 1}`];
            return {
                ...prev,
                [questionId]: { ...currentState, editedOptions: newOptions }
            };
        });
    };

    const handleRemoveOption = (questionId: number, optionIndex: number) => {
        setEditingStates(prev => {
            const currentState = prev[questionId];
            const newOptions = currentState.editedOptions.filter((_, idx) => idx !== optionIndex);
            return {
                ...prev,
                [questionId]: { ...currentState, editedOptions: newOptions }
            };
        });
    };

    const handleSaveQuestion = async (questionId: number) => {
        const editState = editingStates[questionId];
        if (!editState) return;

        try {
            await updateQuestionMutation({
                variables: {
                    id: questionId,
                    text: editState.editedText,
                    correctAnswer: editState.editedCorrectAnswer,
                    questionType: editState.editedQuestionType,
                    // options: editState.editedQuestionType === QuestionType.MultipleChoice ? editState.editedOptions : undefined
                },
                refetchQueries: [{ query: getQuiz, variables: { id: quizId } }]
            });
            
            setEditingStates(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], isEditing: false }
            }));
        } catch (err) {
            console.error("Error updating question:", err);
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
                    const question = getEditableQuestion(q);
                    
                    return (
                        <div 
                            key={question.id} 
                            style={{ 
                                marginBottom: '25px', 
                                padding: '20px', 
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {question.isEditing ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveQuestion(question.id!)}
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
                                                onClick={() => handleEditToggle(question.id!)}
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
                                            onClick={() => handleEditToggle(question.id!)}
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

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Question Text:
                                </label>
                                {question.isEditing ? (
                                    <textarea
                                        value={question.editedText || ''}
                                        onChange={(e) => handleTextChange(question.id!, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            fontSize: '16px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            minHeight: '80px',
                                            resize: 'vertical'
                                        }}
                                    />
                                ) : (
                                    <p style={{ 
                                        padding: '10px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '4px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        {question.text}
                                    </p>
                                )}
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Question Type:
                                </label>
                                {question.isEditing ? (
                                    <select
                                        value={question.editedQuestionType}
                                        onChange={(e) => handleQuestionTypeChange(question.id!, e.target.value as QuestionType)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            fontSize: '16px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc'
                                        }}
                                    >
                                        <option value={QuestionType.MultipleChoice}>MULTIPLE_CHOICE</option>
                                        <option value={QuestionType.TrueFalse}>TRUE_FALSE</option>
                                        <option value={QuestionType.ShortAnswer}>SHORT_ANSWER</option>
                                    </select>
                                ) : (
                                    <p style={{ 
                                        padding: '10px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '4px',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        {question.questionType}
                                    </p>
                                )}
                            </div>

                            {((question.isEditing && question.editedQuestionType === QuestionType.MultipleChoice) || 
                              (!question.isEditing && question.questionType === QuestionType.MultipleChoice)) && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Options:
                                    </label>
                                    {question.isEditing ? (
                                        <div>
                                            {question.editedOptions?.map((option: string | null, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        value={option || ''}
                                                        onChange={(e) => handleOptionChange(question.id!, idx, e.target.value)}
                                                        placeholder={`Option ${idx + 1}`}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px',
                                                            fontSize: '14px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ccc'
                                                        }}
                                                    />
                                                    {question.editedOptions && question.editedOptions.length > 2 && (
                                                        <button
                                                            onClick={() => handleRemoveOption(question.id!, idx)}
                                                            style={{
                                                                padding: '8px 12px',
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
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddOption(question.id!)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    marginTop: '5px'
                                                }}
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    ) : (
                                        <ul style={{ 
                                            padding: '10px 10px 10px 30px', 
                                            backgroundColor: 'white', 
                                            borderRadius: '4px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {question.options?.map((option: string | null, idx: number) => (
                                                <li key={idx} style={{ marginBottom: '5px' }}>{option}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Correct Answer:
                                </label>
                                {question.isEditing ? (
                                    question.editedQuestionType === QuestionType.TrueFalse ? (
                                        <select
                                            value={question.editedCorrectAnswer || ''}
                                            onChange={(e) => handleCorrectAnswerChange(question.id!, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                fontSize: '16px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc'
                                            }}
                                        >
                                            <option value="">Select answer...</option>
                                            <option value="True">True</option>
                                            <option value="False">False</option>
                                        </select>
                                    ) : question.editedQuestionType === QuestionType.MultipleChoice && question.editedOptions ? (
                                        <select
                                            value={question.editedCorrectAnswer || ''}
                                            onChange={(e) => handleCorrectAnswerChange(question.id!, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                fontSize: '16px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc'
                                            }}
                                        >
                                            <option value="">Select correct answer...</option>
                                            {question.editedOptions.map((option: string | null, idx: number) => (
                                                <option key={idx} value={option || ''}>{option}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={question.editedCorrectAnswer || ''}
                                            onChange={(e) => handleCorrectAnswerChange(question.id!, e.target.value)}
                                            placeholder="Enter correct answer"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                fontSize: '16px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc'
                                            }}
                                        />
                                    )
                                ) : (
                                    <p style={{ 
                                        padding: '10px', 
                                        backgroundColor: question.correctAnswer ? '#e7f3ff' : '#fff3cd', 
                                        borderRadius: '4px',
                                        border: `1px solid ${question.correctAnswer ? '#b3d9ff' : '#ffc107'}`,
                                        fontWeight: 'bold'
                                    }}>
                                        {question.correctAnswer || 'No correct answer set'}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
