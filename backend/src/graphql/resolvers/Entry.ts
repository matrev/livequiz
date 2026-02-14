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
          quizId_authorId: {
            quizId,
            authorId: userId
          }
        }
      }) as unknown as Entry;
    }
  },
  Mutation: {
    async upsertEntry(_: any, args: { quizId: number; userId: number; title: string, answers: any }, context: PrismaContext) {
      const { quizId, userId, title, answers } = args;
      const existingEntry = await context.prisma.entry.findUnique({
        where: {
          quizId_authorId: {
            quizId,
            authorId: userId
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
            title,
            answers,
          },
        }) as unknown as Entry;
      } else {
        // Create new entry
        return context.prisma.entry.create({
          data: {
            quizId,
            authorId: userId,
            title,
            answers,
          },
        }) as unknown as Entry;
      }
    },
  },
};

export { EntryResolvers }; 