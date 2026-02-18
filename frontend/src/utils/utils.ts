import { MutationCreateQuizArgs, MutationCreateUserArgs, QuestionType } from "@/generated/types";
import { LiveQuizError } from "./error";

export function validateQuizInput(quizMutationArgs: MutationCreateQuizArgs & MutationCreateUserArgs) {
    let errorMessage: string = "";
    if (quizMutationArgs.title === "") {
        errorMessage = "A Title for a quiz is required.";
    }

    if (quizMutationArgs.userId === undefined) {
        errorMessage = "A userId is required to create a quiz.";
    }

    if (quizMutationArgs.questions?.length === 0) {
        errorMessage = "A quiz must have atleast one question.";
    }
    quizMutationArgs.questions?.forEach((question) => {
        if(question === null) {
            errorMessage = "A quiz must have atleast one question.";
            return;
        }
        if(!question.questionType) {
            errorMessage = "Each question needs a question type."
        }
        if (question.text === null) {
            errorMessage = "Each question needs a title.";
        };
        //only go though options when the question type is multiple choice
        if (question.questionType === QuestionType.MultipleChoice) {
            if(question.options?.length as number <= 1) {
                errorMessage = "a mutliple choice question needs at least two options."
            }
            question.options?.forEach((option) => {
                if (option === null) {
                    errorMessage = "A multiple choice question needs at least two option";
                }
            })

        }
    })

    if (errorMessage !== "") {
        throw new LiveQuizError(errorMessage);
    }
}