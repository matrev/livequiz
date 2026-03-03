import { gql, TypedDocumentNode } from "@apollo/client";
import { UpdateQuestionMutation, MutationUpdateQuestionArgs, CreateQuestionMutation, MutationCreateQuestionArgs, DeleteQuestionMutation, MutationDeleteQuestionArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const updateQuestion: TypedDocumentNode<UpdateQuestionMutation, MutationUpdateQuestionArgs> = gql`
    ${questionFullFields}
    mutation UpdateQuestion($id: Int!, $text: String, $questionType: QuestionType, $correctAnswer: String, $options: [String]) {
        updateQuestion(id: $id, text: $text, questionType: $questionType, correctAnswer: $correctAnswer, options: $options) {
            ...QuestionFullFields
        }
    }
`;

export const createQuestion: TypedDocumentNode<CreateQuestionMutation, MutationCreateQuestionArgs> = gql`
    ${questionFullFields}
    mutation CreateQuestion($text: String!, $questionType: QuestionType!, $correctAnswer: String, $quizId: Int!) {
        createQuestion(text: $text, questionType: $questionType, correctAnswer: $correctAnswer, quizId: $quizId) {
            ...QuestionFullFields
            quizId
        }
    }
`;

export const deleteQuestion: TypedDocumentNode<DeleteQuestionMutation, MutationDeleteQuestionArgs> = gql`
    mutation DeleteQuestion($id: Int!) {
        deleteQuestion(id: $id) {
            id
        }
    }
`;
