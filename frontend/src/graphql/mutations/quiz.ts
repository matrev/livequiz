import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateQuizMutation, MutationCreateQuizArgs, UpdateQuizMutation, MutationUpdateQuizArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const createQuiz: TypedDocumentNode<CreateQuizMutation, MutationCreateQuizArgs> = gql`
    ${questionFullFields}
    mutation CreateQuiz($title: String!, $userId: Int!, $questions: [QuestionInput], $deadline: DateTime, $description: String) {
        createQuiz(title: $title, userId: $userId, questions: $questions, deadline: $deadline, description: $description) {
            title
            description
            userId
            joinCode
            deadline
            questions {
                ...QuestionFullFields
            }
        }
    }
`;

export const updateQuiz: TypedDocumentNode<UpdateQuizMutation, MutationUpdateQuizArgs> = gql`
    mutation UpdateQuiz($id: Int!, $title: String, $description: String, $deadline: DateTime) {
        updateQuiz(id: $id, title: $title, description: $description, deadline: $deadline) {
            id
            title
            description
            deadline
            joinCode
            userId
            createdAt
            updatedAt
        }
    }
`;
