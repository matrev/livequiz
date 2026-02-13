import { gql, TypedDocumentNode } from "@apollo/client";
import { GetQuizQuery, GetQuizzesQuery, GetQuizzesQueryVariables, QueryGetQuizArgs } from "@/generated/types";

export const getQuiz: TypedDocumentNode<GetQuizQuery, QueryGetQuizArgs> = gql`
    query GetQuiz($id: Int!) {
        getQuiz(id: $id) {
            id
            title
            questions {
                id
                text
                questionType
                options
                correctAnswer
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
