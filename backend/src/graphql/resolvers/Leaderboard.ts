import { GraphQLError } from "graphql";
import { Resolvers } from "../../../generated/graphql.js";
import { ResolverContext } from "../../prisma.js";

interface QuizQuestion {
  id: number;
  correctAnswer: string | null;
}

interface QuizEntry {
  id: number;
  name: string | null;
  updatedAt: Date;
  answers: unknown;
  user: { id: number; name: string | null } | null;
}

interface LeaderboardRow {
  userId: number | null;
  name: string;
  score: number;
  correctCount: number;
  answeredCount: number;
  rank: number;
  updatedAt: string;
}

const leaderboardTopic = (quizId: number): string =>
  `LEADERBOARD_UPDATED:${quizId}`;

const normalizeAnswer = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase();

const toAnswerMap = (answers: unknown): Record<string, string> => {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers as Record<string, unknown>)) {
    if (typeof value === "string") {
      mapped[key] = value;
    }
  }
  return mapped;
};

const computeLeaderboard = (
  questions: QuizQuestion[],
  entries: QuizEntry[]
): LeaderboardRow[] => {
  const rows = entries.map((entry) => {
    const answerMap = toAnswerMap(entry.answers);

    let correctCount = 0;
    let answeredCount = 0;

    for (const q of questions) {
      const submitted = answerMap[String(q.id)];
      if (submitted && submitted.trim() !== "") {
        answeredCount += 1;
      }

      if (
        normalizeAnswer(submitted) !== "" &&
        normalizeAnswer(submitted) === normalizeAnswer(q.correctAnswer)
      ) {
        correctCount += 1;
      }
    }

    return {
      userId: entry.user?.id ?? null,
      name: entry.name?.trim() || entry.user?.name?.trim() || `Player ${entry.id}`,
      score: correctCount,
      correctCount,
      answeredCount,
      rank: 0,
      updatedAt: entry.updatedAt.toISOString(),
    };
  });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.updatedAt !== b.updatedAt) return a.updatedAt.localeCompare(b.updatedAt);
    return a.name.localeCompare(b.name);
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
};

const LeaderboardResolvers: Resolvers = {
  Query: {
    async getLeaderboardForQuiz(_parent, args, context) {
      const quizId = Number(args.quizId);
      if (!Number.isInteger(quizId)) {
        throw new GraphQLError("Invalid quizId");
      }

      const quiz = await context.prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            select: {
              id: true,
              correctAnswer: true, // adjust if your field name differs
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

      return computeLeaderboard(
        quiz.questions as QuizQuestion[],
        quiz.entries as QuizEntry[]
      );
    },
  },

  Subscription: {
    leaderboardUpdated: {
      subscribe(_parent: unknown, args: { quizId: number }, context: ResolverContext) {
        const quizId = Number(args.quizId);
        if (!Number.isInteger(quizId)) {
          throw new GraphQLError("Invalid quizId");
        }

        return context.pubsub.asyncIterableIterator<{
          leaderboardUpdated: LeaderboardRow[];
        }>(leaderboardTopic(quizId));
      },
      resolve(payload: { leaderboardUpdated: LeaderboardRow[] }): LeaderboardRow[] {
        return payload.leaderboardUpdated;
      },
    },
  },
};

export { LeaderboardResolvers, computeLeaderboard, leaderboardTopic };