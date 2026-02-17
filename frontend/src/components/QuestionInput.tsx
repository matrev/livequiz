'use client'

import { QuestionInput as QuestionInputType, QuestionType } from "@/generated/types";
import { ChangeEvent } from "react";

type QuestionInputProps = {
    question: QuestionInputType;
    index: number;
    onChange: (updatedQuestion: QuestionInputType) => void;
    showCorrectAnswer?: boolean;
};

export default function QuestionInput({ 
    question, 
    index, 
    onChange, 
    showCorrectAnswer = false 
}: QuestionInputProps) {

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
                newOptions = [""];
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

    const handleCorrectAnswerChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...question, correctAnswer: e.target.value });
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
            {(question.options !== null && question.questionType !== QuestionType.TrueFalse) && <>
                {question.options?.map((option, optionIndex) => {
                    return (
                        <div key={optionIndex}>
                            <label htmlFor={`Question-${index}-Option-${optionIndex}`}>Enter the Option:</label>
                            <input
                                type="text"
                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                value={String(option)}
                                name={`Question-${index}-Option-${optionIndex}`}
                                id={`Question-${index}-Option-${optionIndex}`}
                            />
                        </div>
                    );
                })}
                {question.questionType === QuestionType.MultipleChoice && 
                    <button type="button" onClick={handleAddOption}>Add Option</button>
                }
            </>}
            {showCorrectAnswer && (
                <div>
                    <label htmlFor={`CorrectAnswer-${index}`}>Correct Answer:</label>
                    <input
                        type="text"
                        onChange={handleCorrectAnswerChange}
                        value={question.correctAnswer || ""}
                        name={`CorrectAnswer-${index}`}
                        id={`CorrectAnswer-${index}`}
                    />
                </div>
            )}
        </div>
    );
}