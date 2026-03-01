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
            <div className="mb-4">
                <label htmlFor={`QuestionName-${index}`} className={quizTheme.label}>
                    Question Text:
                </label>
                <input
                    type="text"
                    onChange={handleTextChange}
                    value={question.text || ""}
                    name={`QuestionName-${index}`}
                    id={`QuestionName-${index}`}
                    placeholder="Enter your question here"
                    className={quizTheme.input}
                />
            </div>

            <div className="mb-4">
                <label className={quizTheme.label}>
                    Question Type:
                </label>
                <div className="flex flex-wrap gap-2">
                    <label className={quizTheme.radioLabel}>
                        <input 
                            type="radio"
                            name={`QuestionType-${index}`}
                            value={QuestionType.MultipleChoice}
                            onChange={handleQuestionTypeChange} 
                            checked={question.questionType === QuestionType.MultipleChoice} 
                            className="size-4 accent-cyan-300"
                        />
                        Multiple Choice
                    </label>
                    <label className={quizTheme.radioLabel}>
                        <input 
                            type="radio" 
                            name={`QuestionType-${index}`} 
                            value={QuestionType.ShortAnswer} 
                            onChange={handleQuestionTypeChange}
                            checked={question.questionType === QuestionType.ShortAnswer} 
                            className="size-4 accent-cyan-300"
                        />
                        Short Answer
                    </label>
                    <label className={quizTheme.radioLabel}>
                        <input 
                            type="radio" 
                            name={`QuestionType-${index}`} 
                            value={QuestionType.TrueFalse} 
                            onChange={handleQuestionTypeChange}
                            checked={question.questionType === QuestionType.TrueFalse} 
                            className="size-4 accent-cyan-300"
                        />
                        True / False
                    </label>
                </div>
            </div>

            {question.options !== null && question.questionType === QuestionType.MultipleChoice && (
                <div>
                    <label className={quizTheme.label}>
                        Options:
                    </label>
                    <div className="mb-2 space-y-2">
                        {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex}>
                                <label htmlFor={`Question-${index}-Option-${optionIndex}`} className={`${quizTheme.label} mb-1 text-[11px]`}>
                                    Option {optionIndex + 1}:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="text"
                                        onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                        value={String(option)}
                                        name={`Question-${index}-Option-${optionIndex}`}
                                        id={`Question-${index}-Option-${optionIndex}`}
                                        placeholder={`Enter option ${optionIndex + 1}`}
                                        className={`${quizTheme.input} flex-1`}
                                    />
                                    {question.options && question.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(optionIndex)}
                                            className={quizTheme.buttonDanger}
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
                        className={quizTheme.buttonOutline}
                    >
                        Add Option
                    </button>
                </div>
            )}
        </div>
    );
}