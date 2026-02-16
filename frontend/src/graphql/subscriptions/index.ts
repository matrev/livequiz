import { gql, TypedDocumentNode } from "@apollo/client";

export type LeaderboardEntry = {
  userId: number;
  userName: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
};

export type QuizUpdatePayload = {
  quiz: {
    id: number;
    title: string;
  };
  leaderboard: LeaderboardEntry[];
};

export type QuizUpdatedSubscriptionData = {
  quizUpdated: QuizUpdatePayload;
};

export type QuizUpdatedSubscriptionVariables = {
  quizId: number;
};

export const quizUpdatedSubscription: TypedDocumentNode<
  QuizUpdatedSubscriptionData,
  QuizUpdatedSubscriptionVariables
> = gql`
  subscription QuizUpdated($quizId: Int!) {
    quizUpdated(quizId: $quizId) {
      quiz {
        id
        title
      }
      leaderboard {
        userId
        userName
        correctAnswers
        totalQuestions
        score
      }
    }
  }
`;
