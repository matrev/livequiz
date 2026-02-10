import { Quiz, MutationCreateQuizArgs, QuestionType } from "@/generated/types";

export function validateQuizInput(quizMutationArgs: MutationCreateQuizArgs): string | null {
    // validate quiz questions are there
    quizMutationArgs.questions?.forEach((question) => {
        if(question === null) {
            return "A quiz must have atleast one question.";
        }
        if (question?.text === null) {
            return "Each question needs a title.";
        };
        //only go though options when the question type is multiple choice
        if (question.questionType === QuestionType.MultipleChoice) {
            question?.options?.forEach((option) => {
                if (option === null) {
                    return false;
                }
            })
        }
    })

    if (quizMutationArgs.title === null) {
        return "A Title for a quiz is required.";
    }
    return null;
}