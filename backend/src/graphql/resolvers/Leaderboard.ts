import { GraphQLError } from "graphql";
import { Resolvers } from "../../../generated/graphql.js";
import { QuestionType } from "../../../generated/prisma/enums.js";
import { ResolverContext } from "../../prisma.js";
import { isShortAnswerCorrect } from "../../utils/normalizeAnswer.js";

interface QuizQuestion {
  id: number;
  questionType: QuestionType;
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

const isNumericalCorrect = (
  questionId: number,
  correctAnswer: string | null,
  entries: QuizEntry[]
): Set<string> => {
  const correct = parseFloat(correctAnswer ?? "");
  if (isNaN(correct)) return new Set();

  let bestDiff = Infinity;
  const answerMaps = entries.map((e) => toAnswerMap(e.answers));

  for (const map of answerMaps) {
    const val = parseFloat(map[String(questionId)] ?? "");
    if (!isNaN(val) && val <= correct) {
      const diff = correct - val;
      if (diff < bestDiff) bestDiff = diff;
    }
  }

  if (!isFinite(bestDiff)) return new Set();

  const winners = new Set<string>();
  for (const map of answerMaps) {
    const raw = (map[String(questionId)] ?? "").trim();
    const val = parseFloat(raw);
    if (!isNaN(val) && val <= correct && correct - val === bestDiff) {
      winners.add(raw);
    }
  }
  return winners;
};

const computeLeaderboard = (
  questions: QuizQuestion[],
  entries: QuizEntry[]
): LeaderboardRow[] => {
  const numericalWinners = new Map<number, Set<string>>();
  for (const q of questions) {
    if (q.questionType === "NUMERICAL") {
      numericalWinners.set(q.id, isNumericalCorrect(q.id, q.correctAnswer, entries));
    }
  }

  const rows = entries.map((entry) => {
    const answerMap = toAnswerMap(entry.answers);

    let correctCount = 0;
    let answeredCount = 0;

    for (const q of questions) {
      const submitted = answerMap[String(q.id)];
      if (submitted && submitted.trim() !== "") {
        answeredCount += 1;
      }

      if (q.questionType === "NUMERICAL") {
        const winners = numericalWinners.get(q.id);
        if (winners && submitted && winners.has(submitted.trim())) {
          correctCount += 1;
        }
      }
      
      if (submitted && q.correctAnswer !== null) {
        const isCorrect =
          q.questionType === QuestionType.SHORT_ANSWER
            ? isShortAnswerCorrect(q.correctAnswer, submitted)
            : submitted === q.correctAnswer;
        if (isCorrect) {
          correctCount += 1;
        }
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
              questionType: true,
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