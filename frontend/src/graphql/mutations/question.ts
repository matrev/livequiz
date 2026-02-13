import { gql, TypedDocumentNode } from "@apollo/client";
import { Question, MutationUpdateQuestionArgs } from "@/generated/types";

type UpdateQuestionMutation = {
    updateQuestion: Question;
};

export const updateQuestion: TypedDocumentNode<UpdateQuestionMutation, MutationUpdateQuestionArgs> = gql`
    mutation UpdateQuestion($id: Int!, $text: String, $questionType: QuestionType, $correctAnswer: String) {
        updateQuestion(id: $id, text: $text, questionType: $questionType, correctAnswer: $correctAnswer) {
            id
            text
            questionType
            correctAnswer
            options
        }
    }
`;
