// pull quiz data from the server and display it
'use client'

import QuestionInput from "@/components/QuestionInput";
import { Question, Quiz } from "@/generated/graphql";
import { GetQuizzesQueryVariables, GetQuizzesQuery, QuestionType } from "@/generated/types";
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

const CREATE_QUIZ = gql`
    mutation CreateQuiz($title: String!) {
    createQuiz(title: $title) {
        title
    }
}
`

export default function Home() {
    //   const { loading, error, data } = useQuery(getQuizzes);
    const [createQuiz, { data, loading, error }] = useMutation(CREATE_QUIZ);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [quiz, setQuiz] = useState<Quiz>({} as Quiz);

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            { text: "", questionType: QuestionType.MultipleChoice, id: 1, quizId: 2}
        ]);
    }

    const handleQuestionTypeChange =(e: ChangeEvent<HTMLInputElement, HTMLInputElement>, i: number) => {
        setQuestions((prevQuestions): Question[] => {
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
                    // createQuiz({ variables: { type: quiz }})
                    // setQuiz({} as Quiz);
                }}
            >
                {questions.map
                (
                    (question, index) => {
                    return (
                        <div key={index}>
                            <label htmlFor="QuestionName">Enter the Question:</label>
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
                                 /> Multiple Choice
                            </label>
                            <label>
                                <input 
                                type="radio" 
                                name={`QuestionType-${index}`} 
                                value={QuestionType.ShortAnswer} 
                                onChange={(e) => handleQuestionTypeChange(e, index)}
                                checked={question.questionType === QuestionType.ShortAnswer} 
                                 /> Short Answer
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
                };
                <button onClick={addQuestion}>Add Question</button>
                <br></br>
                <button type="submit">Create Quiz</button>
            </form>
        </div>
    );
}