'use client'

import { MutationCreateQuizArgs, QuestionInput, Quiz } from "@/generated/types";
import { LiveQuizError } from "@/utils/error";
import { validateQuizInput } from "@/utils/utils";
import { useMutation } from "@apollo/client/react";
import { createQuiz as createQuizMutation } from "@/graphql/mutations";
import QuestionInputComponent from "@/components/QuestionInput";

import Link from "next/link";
import { SubmitEvent, useState } from "react";

export default function CreateQuizPage() {
    const [createQuiz, { data, loading, error }] = useMutation<Quiz,MutationCreateQuizArgs>(createQuizMutation, {
        variables: {
            title: "placeholder",
            questions: [],
        },
        onCompleted: () => {
            setSuccessMessage("Quiz created successfully.");
            setErrorMessage(null);
        },
        onError: () => {
            setSuccessMessage(null);
        }
    });
    const [questions, setQuestions] = useState<QuestionInput[]>([]);
    const [title, setTitle] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            {} as QuestionInput
        ]);
    }

    const updateQuestion = (index: number, updatedQuestion: QuestionInput) => {
        setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            validateQuizInput({title, questions})
            const deadlineIso = deadline ? new Date(deadline).toISOString() : undefined;
            createQuiz({ variables: { title: title, questions: questions, deadline: deadlineIso }});
        } catch (error) {
            if (error instanceof LiveQuizError) {
                setErrorMessage(error.message);
            }
            return;
        }
        setTitle("");
        setErrorMessage(null);
        setQuestions([]);
        setDeadline("");
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
                <label htmlFor="QuizDeadline">Deadline for Responses (optional):</label>
                <input
                    type="datetime-local"
                    onChange={(e) => {
                        setDeadline(e.target.value);
                    }}
                    value={deadline}
                    name="QuizDeadline"
                    id="QuizDeadline"
                />
                <br />
                {questions.map((question, index) => (
                    <QuestionInputComponent
                        key={index}
                        question={question}
                        index={index}
                        onChange={(updated) => updateQuestion(index, updated)}
                    />
                ))}
                <button type="button" onClick={addQuestion}>Add Question</button>
                <br></br>
                {errorMessage && <p>{errorMessage}</p>}
                {successMessage && <p>{successMessage} {data?.joinCode}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Quiz"}
                </button>
            </form>
        </div>
    );
}