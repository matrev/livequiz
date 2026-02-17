'use client'

import { QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import { ChangeEvent } from "react";

type QuestionInputProps = {
    question: QuestionInputType;
    index: number;
    onChange: (updatedQuestion: QuestionInputType) => void;
};

/**
 * Component for creating new questions in quiz creation flow.
 * Uses radio buttons for question type selection and minimal styling.
 * 
 * @example
 * <QuestionInput 
 *   question={question} 
 *   index={0} 
 *   onChange={(updated) => setQuestions(prev => [...prev, updated])} 
 * />
 */
export default function QuestionInput({ question, index, onChange }: QuestionInputProps) {
    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...question, text: e.target.value });
    };

    const handleQuestionTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newType = e.target.value as QuestionType;
        let newOptions: string[] | null = null;
        
        switch (newType) {
            case QuestionType.ShortAnswer:
                newOptions = null;
                break;
            case QuestionType.TrueFalse:
                newOptions = ["True", "False"];
                break;
            case QuestionType.MultipleChoice:
                newOptions = question.options && question.options.length > 0 
                    ? question.options.filter((opt): opt is string => opt != null)
                    : ["Option 1", "Option 2"];
                break;
        }
        
        onChange({ ...question, questionType: newType, options: newOptions });
    };

    const handleOptionChange = (optionIndex: number, newValue: string) => {
        const updatedOptions = question.options?.map((opt, idx) =>
            idx === optionIndex ? newValue : opt
        );
        onChange({ ...question, options: updatedOptions });
    };

    const handleAddOption = () => {
        const newOptions = question.options ? [...question.options, ""] : [""];
        onChange({ ...question, options: newOptions });
    };

    const handleRemoveOption = (optionIndex: number) => {
        const updatedOptions = question.options?.filter((_, idx) => idx !== optionIndex);
        onChange({ ...question, options: updatedOptions });
    };

    return (
        <div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor={`QuestionName-${index}`} style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Question Text:
                </label>
                <input
                    type="text"
                    onChange={handleTextChange}
                    value={question.text || ""}
                    name={`QuestionName-${index}`}
                    id={`QuestionName-${index}`}
                    placeholder="Enter your question here"
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

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Question Type:
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="radio"
                            name={`QuestionType-${index}`}
                            value={QuestionType.MultipleChoice}
                            onChange={handleQuestionTypeChange} 
                            checked={question.questionType === QuestionType.MultipleChoice} 
                        />
                        Multiple Choice
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name={`QuestionType-${index}`} 
                            value={QuestionType.ShortAnswer} 
                            onChange={handleQuestionTypeChange}
                            checked={question.questionType === QuestionType.ShortAnswer} 
                        />
                        Short Answer
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name={`QuestionType-${index}`} 
                            value={QuestionType.TrueFalse} 
                            onChange={handleQuestionTypeChange}
                            checked={question.questionType === QuestionType.TrueFalse} 
                        />
                        True / False
                    </label>
                </div>
            </div>

            {question.options !== null && question.questionType === QuestionType.MultipleChoice && (
                <div style={{ marginBottom: '0' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Options:
                    </label>
                    <div style={{ marginBottom: '10px' }}>
                        {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} style={{ marginBottom: '10px' }}>
                                <label htmlFor={`Question-${index}-Option-${optionIndex}`} style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                                    Option {optionIndex + 1}:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                        value={String(option)}
                                        name={`Question-${index}-Option-${optionIndex}`}
                                        id={`Question-${index}-Option-${optionIndex}`}
                                        placeholder={`Enter option ${optionIndex + 1}`}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    {question.options && question.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(optionIndex)}
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
                            </div>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={handleAddOption}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Add Option
                    </button>
                </div>
            )}
        </div>
    );
}