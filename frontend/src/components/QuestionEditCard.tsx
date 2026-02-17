'use client'

import { Question, QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import QuestionEditor from "@/components/QuestionEditor";

type QuestionWithId = Omit<Question, 'quizId'> & { id: number };

type QuestionEditCardProps = {
    question: QuestionWithId;
    index: number;
    isEditing: boolean;
    isSaving: boolean;
    questionDraft: QuestionInputType;
    questionErrorMessage: string;
    questionSuccessMessage: string;
    onSave: (questionId: number) => void;
    onToggleEdit: (questionId: number) => void;
    onChange: (questionId: number, updatedQuestion: QuestionInputType) => void;
};

export default function QuestionEditCard({
    question,
    index,
    isEditing,
    isSaving,
    questionDraft,
    questionErrorMessage,
    questionSuccessMessage,
    onSave,
    onToggleEdit,
    onChange
}: QuestionEditCardProps) {
    return (
        <div
            key={question.id}
            style={{
                marginBottom: '25px',
                padding: '20px',
                border: '2px solid #ddd',
                borderRadius: '8px',
            }}
        >
            {questionErrorMessage && (
                <div
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    style={{
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        border: '1px solid #f5c6cb',
                        borderRadius: '4px'
                    }}>
                    {questionErrorMessage}
                </div>
            )}
            {questionSuccessMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px'
                    }}>
                    {questionSuccessMessage}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Question {index + 1}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => onSave(question.id)}
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
                                onClick={() => onToggleEdit(question.id)}
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
                            onClick={() => onToggleEdit(question.id)}
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
                    onChange={(updated) => onChange(question.id, updated)}
                />
            ) : (
                <>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Question Text:
                        </label>
                        <p style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                        }}>
                            {question.text}
                        </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Question Type:
                        </label>
                        <p style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                        }}>
                            {question.questionType}
                        </p>
                    </div>

                    {question.questionType === QuestionType.MultipleChoice && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Options:
                            </label>
                            <ul style={{
                                padding: '10px 10px 10px 30px',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                            }}>
                                {question.options?.map((option: string | null, idx: number) => (
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
                            backgroundColor: question.correctAnswer ? '#e7f3ff' : '#fff3cd',
                            borderRadius: '4px',
                            border: `1px solid ${question.correctAnswer ? '#b3d9ff' : '#ffc107'}`,
                            fontWeight: 'bold',
                            color: question.correctAnswer ? '#3178c6' : '#856404'
                        }}>
                            {question.correctAnswer || 'No correct answer set'}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
