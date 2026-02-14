'use client'

import { QuestionType, MutationCreateQuizArgs, QuestionInput, Quiz } from "@/generated/types";
import { LiveQuizError } from "@/utils/error";
import { validateQuizInput } from "@/utils/utils";
import { useMutation } from "@apollo/client/react";
import { createQuiz as createQuizMutation } from "@/graphql/mutations";

import Link from "next/link";
import { ChangeEvent, SubmitEvent, useState } from "react";

export default function CreateQuizPage() {
    const [createQuiz, { data, loading, error }] = useMutation<Quiz,MutationCreateQuizArgs>(createQuizMutation, {
        variables: {
            title: "placeholder",
            questions: [],
        }
    });
    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [title, setTitle] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {} as QuestionInput
        ]);
    }

    const addQuestionOption = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, i: number) => {
        setQuestions((prevQuestions): QuestionInput[] => {
            return prevQuestions.map((item, index) => {
                if (index !== i) {
                    return item;
                }
                const newOptions = item.options ? [...item.options, ""] : [""];
                return {...item, options: newOptions}
            })
        });
    }

    const handleQuestionTypeChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>, i: number) => {
        setQuestions((prevQuestions): QuestionInput[] => {
            return prevQuestions.map((item, index) => {
                if (index === i) {
                    switch (e.target.value) {
                        case QuestionType.ShortAnswer:
                            item.options = null
                            break
                        case QuestionType.TrueFalse:
                            item.options = ["True", "False"]
                            break
                        default:
                            item.options = [""]
                    }
                    return {...item, questionType: e.target.value as QuestionType}
                }
                return item;
            })
        });
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            validateQuizInput({title, questions})
            createQuiz({ variables: { title: title, questions: questions }});
        } catch (error) {
            if (error instanceof LiveQuizError) {
                setErrorMessage(error.message);
            }
            return;
        }
        setTitle("");
        setErrorMessage("");
        setQuestions([]);
    }

    return (
        <div>
            <Link href="/">back to home</Link>
            <form onSubmit={handleSubmit}>
                <label htmlFor="QuizTitle">Enter the Title for the Quiz:</label>
                <input
                    type="text"
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
                    value={title}
                    name={`QuizTitle`}
                    id={`QuizTitle`}
                />
                <br />
                {questions.map
                (
                    (question, index) => {
                    return (
                        <div key={index}>
                            <label htmlFor={`QuestionName-${index}`}>Enter the Question:</label>
                                <input
                                    type="text"
                                    onChange={(e) => {
                                        question.text = e.target.value;
                                    }}
                                    name={`QuestionName-${index}`}
                                    id={`QuestionName-${index}`}
                                    />
                            <label>
                                <input 
                                    type="radio"
                                    name={`QuestionType-${index}`}
                                    value={QuestionType.MultipleChoice}
                                    onChange={(e) => handleQuestionTypeChange(e, index)} 
                                    checked={question.questionType === QuestionType.MultipleChoice} 
                                />
                                Multiple Choice
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name={`QuestionType-${index}`} 
                                    value={QuestionType.ShortAnswer} 
                                    onChange={(e) => handleQuestionTypeChange(e, index)}
                                    checked={question.questionType === QuestionType.ShortAnswer} 
                                />
                                Short Answer
                            </label>
                            <label>
                                <input 
                                type="radio" 
                                name={`QuestionType-${index}`} 
                                value={QuestionType.TrueFalse} 
                                onChange={(e) => handleQuestionTypeChange(e, index)}
                                checked={question.questionType === QuestionType.TrueFalse} 
                                 /> True / False
                            </label>
                            <br/>
                            {(question.options !== null && question.questionType !== QuestionType.TrueFalse) && <>
                                {question.options?.map((option, optionIndex) => {
                                    return (<div key={optionIndex}>
                                        <label htmlFor={`Question-${index}-Option-${optionIndex}`}>Enter the Option:</label>
                                        <input
                                            type="text"
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setQuestions(prev => {
                                                    return prev.map((q, qIdx) => {
                                                    if (qIdx !== index) return q;
                                                    const updatedOpts = q.options?.map((opt, optIdx) =>
                                                        optIdx === optionIndex ? newValue : opt
                                                    );
                                                    return { ...q, options: updatedOpts };
                                                    });
                                                });
                                            }}
                                            value={String(option)}
                                            name={`Question-${index}-Option-${optionIndex}`}
                                            id={`Question-${index}-Option-${optionIndex}`}
                                        />
                                    </div>)
                                })}
                                {question.questionType === QuestionType.MultipleChoice && 
                                    <button type="button" onClick={(e) => addQuestionOption(e, index)}>Add Option</button>
                                }
                            </>}
                        </div>
                )})
                }
                <button type="button" onClick={addQuestion}>Add Question</button>
                <br></br>
                <p>{errorMessage !== null && errorMessage}</p>
                <button type="submit">Create Quiz</button>
            </form>
        </div>
    );
}