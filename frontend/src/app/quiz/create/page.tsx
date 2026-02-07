// pull quiz data from the server and display it
'use client'

import { MutationCreateQuizArgs, QuestionInput, Quiz } from "@/generated/graphql";
import { QuestionType } from "@/generated/types";
import { gql, TypedDocumentNode } from "@apollo/client";

// use the generated types for your query
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

// const getQuizzes: TypedDocumentNode<GetQuizzesQuery, GetQuizzesQueryVariables> = gql`
//     query GetQuizzes {
//         getAllQuizzes {
//             id
//             title
//         }
//     }
// `

const CREATE_QUIZ: TypedDocumentNode<Quiz,MutationCreateQuizArgs> = gql`
    mutation CreateQuiz($title: String!, $questions: [QuestionInput]) {
    createQuiz(title: $title, questions: $questions) {
        title
        questions{
            correctAnswer
            text
            questionType
        }
    }
}
`

export default function Home() {
    //   const { loading, error, data } = useQuery(getQuizzes);
    const [createQuiz, { data, loading, error }] = useMutation<Quiz,MutationCreateQuizArgs>(CREATE_QUIZ, {
        variables: {
            title: "placeholder",
            questions: [],
        }
    }
    );
    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [title, setTitle] = useState<string>("");

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {} as QuestionInput
        ]);
    }

    const handleQuestionTypeChange =(e: ChangeEvent<HTMLInputElement, HTMLInputElement>, i: number) => {
        setQuestions((prevQuestions): QuestionInput[] => {
            return prevQuestions.map((item, index) => {
                if (index === i) {
                    return {...item, questionType: e.target.value as QuestionType}
                }
                return item;
            })
        });
    }

    return (
        <div>
            <Link href="/"> back to home</Link>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log('questions: ', questions)
                    createQuiz({ variables: { title: title, questions: questions }})
                    setTitle("");
                    setQuestions([]);
                }}
            >
                <label htmlFor="QuizTitle">Enter the Title for the Quiz:</label>
                <input
                    type="text"
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
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
                        </div>
                )})
                }
                <button type="button" onClick={addQuestion}>Add Question</button>
                <br></br>
                <button type="submit">Create Quiz</button>
            </form>
        </div>
    );
}