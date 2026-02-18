import { Resolvers, Entry } from "../../../generated/graphql.js";
import { ResolverContext } from "../../prisma.js";
import { publishLeaderboardUpdated } from "../../utils/publishLeaderboardUpdated.js";


const EntryResolvers: Resolvers = {
  Query: {
    getAllEntries(_: any, __: any, context: ResolverContext) {
      return context.prisma.entry.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      }) as unknown as Entry[];
    },
    getEntriesForUser(_: any, args: { userId: number }, context: ResolverContext) {
      const { userId } = args;
      return context.prisma.entry.findMany({
        where: {
          id: userId,
        },
      }) as unknown as Entry[];
    },
    getEntryForUser(_: any, args: { quizId: number, userId: number }, context: ResolverContext) {
      const { quizId, userId } = args;
      return context.prisma.entry.findMany({
        where: {
          quizId,
          userId
        }
      }) as unknown as Entry;
    },
    getEntriesForQuiz(_: any, args: { quizId: number }, context: ResolverContext) {
      const { quizId } = args;
      return context.prisma.entry.findMany({
        where: {
          quizId,
        },
      }) as unknown as Entry[];
    },
  },
  Mutation: {
    async upsertEntry(_: any, args: { quizId: number; name: string, answers: any, userId?: number }, context: ResolverContext) {
      const { quizId, name, answers, userId = null } = args;

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

      const existingEntry = await context.prisma.entry.findFirst({
        where: {
          quizId,
          userId,
        },
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
        const savedEntry = await context.prisma.entry.create({
          data: {
            quizId,
            userId,
            name,
            answers,
          },
        });

        await publishLeaderboardUpdated(context, Number(args.quizId));

        return savedEntry as unknown as Entry;
      }
    },
  },
};

export { EntryResolvers };