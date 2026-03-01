'use client'

import { QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import { ChangeEvent } from "react";
import { quizTheme } from "@/app/quiz/theme";

type QuestionEditorProps = {
    question: QuestionInputType;
    index: number;
    onChange: (updatedQuestion: QuestionInputType) => void;
};

/**
 * Component for editing existing questions in quiz edit flow.
 * Uses dropdowns, textareas, and styled inputs for better UX.
 * Includes correct answer management and option removal.
 * 
 * @example
 * <QuestionEditor 
 *   question={editedQuestion} 
 *   index={0} 
 *   onChange={(updated) => handleQuestionChange(questionId, updated)} 
 * />
 */
export default function QuestionEditor({ question, index, onChange }: QuestionEditorProps) {
    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
                newOptions = question.options && question.options.length > 0 
                    ? question.options.filter((opt): opt is string => opt !== null && opt !== undefined)
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

    const handleRemoveOption = (optionIndex: number) => {
        if (!question.options || question.options.length <= 2) return;
        const updatedOptions = question.options.filter((_, idx) => idx !== optionIndex);
        onChange({ ...question, options: updatedOptions });
    };

    const handleCorrectAnswerChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ ...question, correctAnswer: e.target.value });
    };

    return (
        <div>
            <label htmlFor={`QuestionText-${index}`} className={quizTheme.label}>
                Question Text:
            </label>
            <textarea
                onChange={handleTextChange}
                value={question.text || ""}
                name={`QuestionText-${index}`}
                id={`QuestionText-${index}`}
                className={quizTheme.textarea}
            />

            <label htmlFor={`QuestionType-${index}`} className={`${quizTheme.label} mt-4`}>
                Question Type:
            </label>
            <select
                value={question.questionType}
                onChange={handleQuestionTypeChange}
                name={`QuestionType-${index}`}
                id={`QuestionType-${index}`}
                className={quizTheme.select}
            >
                <option value={QuestionType.MultipleChoice}>Multiple Choice</option>
                <option value={QuestionType.TrueFalse}>True/False</option>
                <option value={QuestionType.ShortAnswer}>Short Answer</option>
            </select>

            {question.options !== null && question.questionType === QuestionType.MultipleChoice && (
                <div className="mt-4">
                    <label className={quizTheme.label}>
                        Options:
                    </label>
                    {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="mb-2 flex flex-wrap items-center gap-2">
                            <input
                                type="text"
                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                value={String(option)}
                                placeholder={`Option ${optionIndex + 1}`}
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
                    ))}
                    <button 
                        type="button" 
                        onClick={handleAddOption}
                        className={`${quizTheme.buttonOutline} mt-1`}
                    >
                        + Add Option
                    </button>
                </div>
            )}

            <div className="mt-4">
                <label htmlFor={`CorrectAnswer-${index}`} className={quizTheme.label}>
                    Correct Answer:
                </label>
                {question.questionType === QuestionType.TrueFalse ? (
                    <select
                        value={question.correctAnswer || ''}
                        onChange={handleCorrectAnswerChange}
                        name={`CorrectAnswer-${index}`}
                        id={`CorrectAnswer-${index}`}
                        className={quizTheme.select}
                    >
                        <option value="">Select answer...</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                    </select>
                ) : question.questionType === QuestionType.MultipleChoice && question.options ? (
                    <select
                        value={question.correctAnswer || ''}
                        onChange={handleCorrectAnswerChange}
                        name={`CorrectAnswer-${index}`}
                        id={`CorrectAnswer-${index}`}
                        className={quizTheme.select}
                    >
                        <option value="">Select correct answer...</option>
                        {question.options.map((option, idx) => (
                            <option key={idx} value={option || ''}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        onChange={handleCorrectAnswerChange}
                        value={question.correctAnswer || ""}
                        name={`CorrectAnswer-${index}`}
                        id={`CorrectAnswer-${index}`}
                        placeholder="Enter correct answer"
                        className={quizTheme.input}
                    />
                )}
            </div>
        </div>
    );
}