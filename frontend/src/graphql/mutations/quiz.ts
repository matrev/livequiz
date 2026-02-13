import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateQuizMutation, MutationCreateQuizArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const createQuiz: TypedDocumentNode<CreateQuizMutation, MutationCreateQuizArgs> = gql`
    ${questionFullFields}
    mutation CreateQuiz($title: String!, $questions: [QuestionInput]) {
        createQuiz(title: $title, questions: $questions) {
            title
            questions {
                ...QuestionFullFields
            }
        }
    }
`;
