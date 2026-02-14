import { Resolvers, QuizUpdatePayload, LeaderboardEntry } from "../../../generated/graphql.js";
import { PrismaContext } from "../../prisma.js";

/**
 * Calculates the leaderboard for a quiz based on submitted entries.
 * Compares answers against correct answers and calculates scores.
 */
async function calculateLeaderboard(quizId: number, context: PrismaContext): Promise<LeaderboardEntry[]> {
  const entries = await context.prisma.entry.findMany({
    where: { quizId },
    include: {
      author: true,
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  const leaderboard: LeaderboardEntry[] = entries.map((entry) => {
    let correctAnswers = 0;
    const questions = entry.quiz.questions;

    if (entry.answers && typeof entry.answers === "object") {
      questions.forEach((question) => {
        const questionId = String(question.id);
        const userAnswer = (entry.answers as Record<string, any>)[questionId];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) {
          correctAnswers++;
        }
      });
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      userId: entry.author.id,
      userName: entry.author.name || entry.author.email,
      correctAnswers,
      totalQuestions,
      score,
    };
  });

  // Sort by score descending, then by correct answers
  return leaderboard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.correctAnswers - a.correctAnswers;
  });
}

const SubscriptionResolvers: Resolvers = {
  Subscription: {
    quizUpdated: {
      /**
       * Subscription resolver that returns updates to a quiz with live leaderboard.
       * In a real implementation, this would use PubSub or WebSocket subscriptions.
       */
      subscribe: async (_: any, args: { quizId: number }, context: PrismaContext) => {
        const { quizId } = args;

        // Validate quiz exists
        const quiz = await context.prisma.quiz.findUnique({
          where: { id: quizId },
          include: { questions: true },
        });

        if (!quiz) {
          throw new Error(`Quiz with id ${quizId} not found`);
        }

        // Return an async generator for subscription updates
        // In a production app, this would be connected to PubSub or WebSocket events
        async function* subscriptionGenerator() {
          // Initial payload
          const leaderboard = await calculateLeaderboard(quizId, context);
          yield {
            quizUpdated: {
              quiz,
              leaderboard,
            },
          };

          // In production, you would set up event listeners here
          // and yield updates when quiz data changes
        }

        return subscriptionGenerator();
      },

      /**
       * Resolve the subscription payload to the final value
       */
      resolve: (payload: any) => {
        return payload.quizUpdated as QuizUpdatePayload;
      },
    },
  },
};

export { SubscriptionResolvers, calculateLeaderboard };
