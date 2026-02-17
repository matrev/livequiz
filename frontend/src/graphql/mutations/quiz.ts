import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateQuizMutation, MutationCreateQuizArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const createQuiz: TypedDocumentNode<CreateQuizMutation, MutationCreateQuizArgs> = gql`
    ${questionFullFields}
    mutation CreateQuiz($title: String!, $userId: Int!, $questions: [QuestionInput], $deadline: DateTime) {
        createQuiz(title: $title, userId: $userId, questions: $questions, deadline: $deadline) {
            title
            userId
            joinCode
            deadline
            questions {
                ...QuestionFullFields
            }
        }
    }
`;
