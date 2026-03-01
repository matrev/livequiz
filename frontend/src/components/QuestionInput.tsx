'use client'

import { QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import { ChangeEvent } from "react";
import { quizTheme } from "@/app/quiz/theme";

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

    const handleQuestionTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
                newOptions = ["Option 1", "Option 2"];
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
        <>
            <input
                type="text"
                onChange={handleTextChange}
                value={question.text || ""}
                name={`QuestionName-${index}`}
                id={`QuestionName-${index}`}
                placeholder="Enter your question here"
                className={quizTheme.input}
            />

            <label className={quizTheme.label}>
                Question Type:
            </label>
            <select
                id={`QuestionType-${index}`}
                name={`QuestionType-${index}`}
                value={question.questionType}
                onChange={handleQuestionTypeChange}
                className={quizTheme.select}
            >
                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                <option value={QuestionType.ShortAnswer}>Short Answer</option>
                <option value={QuestionType.TrueFalse}>True / False</option>
            </select>

            {question.options !== null && question.questionType === QuestionType.MultipleChoice && (
                <>
                    <label className={quizTheme.label}>
                        Options:
                    </label>
                    {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex}>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <input
                                    type="text"
                                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                    value={String(option)}
                                    name={`Question-${index}-Option-${optionIndex}`}
                                    id={`Question-${index}-Option-${optionIndex}`}
                                    placeholder={`Enter option ${optionIndex + 1}`}
                                    className={`${quizTheme.input} mb-0! flex-1`}
                                />
                                {question.options && question.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(optionIndex)}
                                        className={`${quizTheme.buttonDanger} self-center`}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={handleAddOption}
                        className={quizTheme.buttonOutline}
                    >
                        Add Option
                    </button>
                </>
            )}
        </>
    );
}