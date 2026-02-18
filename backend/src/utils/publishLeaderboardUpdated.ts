import { GraphQLError } from "graphql";
import { computeLeaderboard, leaderboardTopic } from "../graphql/resolvers/Leaderboard.js";

interface ResolverContext {
  prisma: {
    quiz: {
      findUnique: (args: {
        where: { id: number };
        include: {
          questions: { select: { id: true; correctAnswer: true } };
          entries: {
            include: {
              user: { select: { id: true; name: true } };
            };
          };
        };
      }) => Promise<{
        questions: Array<{ id: number; correctAnswer: string | null }>;
        entries: Array<{
          id: number;
          name: string | null;
          updatedAt: Date;
          answers: unknown;
          user: { id: number; name: string | null } | null;
        }>;
      } | null>;
    };
  };
  pubsub: {
    publish: (
      topic: string,
      payload: { leaderboardUpdated: ReturnType<typeof computeLeaderboard> }
    ) => Promise<void> | void;
  };
}

export const publishLeaderboardUpdated = async (
  context: ResolverContext,
  quizId: number
): Promise<void> => {
  if (!Number.isInteger(quizId)) {
    throw new GraphQLError("Invalid quizId");
  }

  if (!context?.prisma?.quiz?.findUnique) {
    throw new GraphQLError("Invalid resolver context: prisma.quiz.findUnique missing");
  }

  if (!context?.pubsub || typeof context.pubsub.publish !== "function") {
    throw new GraphQLError("PubSub is not configured in resolver context");
  }

  const quiz = await context.prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        select: {
          id: true,
          correctAnswer: true,
        },
      },
      entries: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new GraphQLError("Quiz not found");
  }

  const rows = computeLeaderboard(quiz.questions, quiz.entries);
  await context.pubsub.publish(leaderboardTopic(quizId), {
    leaderboardUpdated: rows,
  });
};