import { GetLeaderboardForQuizQuery, GetLeaderboardForQuizQueryVariables } from "@/generated/types";
import { gql, TypedDocumentNode } from "@apollo/client";

export const getLeaderboardForQuiz: TypedDocumentNode<
    GetLeaderboardForQuizQuery,
    GetLeaderboardForQuizQueryVariables
> = gql`
    query GetLeaderboardForQuiz($quizId: Int!) {
        getLeaderboardForQuiz(quizId: $quizId) {
            userId
            name
            score
            correctCount
            answeredCount
            rank
            updatedAt
        }
    }
`;