import { gql, TypedDocumentNode } from "@apollo/client";
import { UpdateQuestionMutation, MutationUpdateQuestionArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const updateQuestion: TypedDocumentNode<UpdateQuestionMutation, MutationUpdateQuestionArgs> = gql`
    ${questionFullFields}
    mutation UpdateQuestion($id: Int!, $text: String, $questionType: QuestionType, $correctAnswer: String) {
        updateQuestion(id: $id, text: $text, questionType: $questionType, correctAnswer: $correctAnswer) {
            ...QuestionFullFields
        }
    }
`;
