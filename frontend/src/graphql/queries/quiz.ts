import { gql, TypedDocumentNode } from "@apollo/client";
import { GetQuizQuery, GetQuizzesQuery, GetQuizzesQueryVariables, QueryGetQuizArgs } from "@/generated/types";
import { questionFullFields } from "../fragments";

export const getQuiz: TypedDocumentNode<GetQuizQuery, QueryGetQuizArgs> = gql`
    ${questionFullFields}
    query GetQuiz($id: Int!) {
        getQuiz(id: $id) {
            id
            title
            questions {
                ...QuestionFullFields
            }
        }
    }
`;

export const getQuizzes: TypedDocumentNode<GetQuizzesQuery, GetQuizzesQueryVariables> = gql`
    query GetQuizzes {
        getAllQuizzes {
            id
            title
        }
    }
`;
