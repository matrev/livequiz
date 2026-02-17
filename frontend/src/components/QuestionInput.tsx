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
                    : ["Option 1", "Option 2", "Option 3", "Option 4"];
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

    return (
        <div>
            <label htmlFor={`QuestionName-${index}`}>Enter the Question:</label>
            <input
                type="text"
                onChange={handleTextChange}
                value={question.text || ""}
                name={`QuestionName-${index}`}
                id={`QuestionName-${index}`}
            />

            <label>Select Question Type:</label>
            <label>
                <input 
                    type="radio"
                    name={`QuestionType-${index}`}
                    value={QuestionType.MultipleChoice}
                    onChange={handleQuestionTypeChange} 
                    checked={question.questionType === QuestionType.MultipleChoice} 
                />
                Multiple Choice
            </label>
            <label>
                <input 
                    type="radio" 
                    name={`QuestionType-${index}`} 
                    value={QuestionType.ShortAnswer} 
                    onChange={handleQuestionTypeChange}
                    checked={question.questionType === QuestionType.ShortAnswer} 
                />
                Short Answer
            </label>
            <label>
                <input 
                    type="radio" 
                    name={`QuestionType-${index}`} 
                    value={QuestionType.TrueFalse} 
                    onChange={handleQuestionTypeChange}
                    checked={question.questionType === QuestionType.TrueFalse} 
                />
                True / False
            </label>
            <br/>

            {question.options !== null && question.questionType === QuestionType.MultipleChoice && (
                <div>
                    {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex}>
                            <label htmlFor={`Question-${index}-Option-${optionIndex}`}>
                                Enter the Option:
                            </label>
                            <input
                                type="text"
                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                value={String(option)}
                                name={`Question-${index}-Option-${optionIndex}`}
                                id={`Question-${index}-Option-${optionIndex}`}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddOption}>
                        Add Option
                    </button>
                </div>
            )}
        </div>
    );
}