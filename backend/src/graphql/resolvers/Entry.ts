import { Resolvers, Entry } from "../../../generated/graphql.js";
import { PrismaContext } from "../../prisma.js";

const EntryResolvers: Resolvers = {
  Query: {
    getAllEntries(_: any, __: any, context: PrismaContext) {
      return context.prisma.entry.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      }) as unknown as Entry[];
    },
    getEntriesForUser(_: any, args: { userId: number }, context: PrismaContext) {
      const { userId } = args;
      return context.prisma.entry.findMany({
        where: {
          id: userId,
        },
      }) as unknown as Entry[];
    },
    getEntryForUser(_: any, args: { quizId: number, userId: number }, context: PrismaContext) {
      const { quizId, userId } = args;
      return context.prisma.entry.findUnique({
        where: {
          quizId_userId: {
            quizId,
            userId
          }
        }
      }) as unknown as Entry;
    },
    getEntriesForQuiz(_: any, args: { quizId: number }, context: PrismaContext) {
      const { quizId } = args;
      return context.prisma.entry.findMany({
        where: {
          quizId,
        },
      }) as unknown as Entry[];
    },
  },
  Mutation: {
    async upsertEntry(_: any, args: { quizId: number; userId: number; name: string, answers: any }, context: PrismaContext) {
      const { quizId, userId, name, answers } = args;

      // Check if quiz deadline has passed
      const quiz = await context.prisma.quiz.findUnique({
        where: { id: quizId },
        select: { deadline: true },
      });

      if (!quiz) {
        throw new Error(`Quiz with id ${quizId} not found`);
      }

      if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
        throw new Error("Quiz deadline has passed. Submissions are no longer accepted.");
      }

      const existingEntry = await context.prisma.entry.findUnique({
        where: {
          quizId_userId: {
            quizId,
            userId
          }
        }
      });

      if (existingEntry) {
        // Update existing entry
        return context.prisma.entry.update({
          where: {
            id: existingEntry.id,
          },
          data: {
            name,
            answers,
          },
        }) as unknown as Entry;
      } else {
        // Create new entry
        return context.prisma.entry.create({
          data: {
            quizId,
            userId,
            name,
            answers,
          },
        }) as unknown as Entry;
      }
    },
  },
};

export { EntryResolvers }; 