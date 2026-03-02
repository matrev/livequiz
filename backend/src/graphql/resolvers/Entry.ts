import { Resolvers, Entry } from "../../../generated/graphql.js";
import { ResolverContext } from "../../prisma.js";
import { publishLeaderboardUpdated } from "../../utils/publishLeaderboardUpdated.js";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


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
    async upsertEntry(
      _: any,
      args: { quizId: number; name: string; answers: any; userId?: number },
      context: ResolverContext
    ) {
      const { quizId, name, answers, userId } = args;

      // Check if quiz deadline has passed
      const quiz = await context.prisma.quiz.findUnique({
        where: { id: quizId },
        select: { deadline: true, title: true, joinCode: true },
      });

      if (!quiz) {
        throw new Error(`Quiz with id ${quizId} not found`);
      }

      if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
        throw new Error("Quiz deadline has passed. Submissions are no longer accepted.");
      }

      const existingEntry =
        userId != null
          ? await context.prisma.entry.findFirst({
              where: { quizId, userId },
            })
          : null;

      if (existingEntry) {
        // Update existing entry
        return context.prisma.entry.update({
          where: { id: existingEntry.id },
          data: { name, answers },
        }) as unknown as Entry;
      }

      // Create new entry
      const savedEntry = await context.prisma.entry.create({
        data: {
          quizId,
          userId: userId ?? null,
          name,
          answers,
        },
      });

      if (userId != null) {
        const entrant = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (entrant?.email) {
          try {
            const baseUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
            const leaderboardUrl = `${baseUrl}/quiz/leaderboard/${quiz.joinCode}`;
            const deadlineText = quiz.deadline
              ? `The quiz closes on ${new Date(quiz.deadline).toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'short' })} UTC.`
              : 'This quiz has no submission deadline.';
            await context.emailSender.send({
              to: entrant.email,
              subject: `Entry received for "${quiz.title}"`,
              text: `Hi ${entrant.name ?? 'there'}, your entry for "${quiz.title}" was submitted successfully.\n\n${deadlineText}\n\nView the live leaderboard here:\n${leaderboardUrl}`,
              html: `<p>Hi ${escapeHtml(entrant.name ?? '')}, your entry for <strong>${escapeHtml(quiz.title)}</strong> was submitted successfully.</p><p>${escapeHtml(deadlineText)}</p><p><strong>Live leaderboard:</strong> <a href="${leaderboardUrl}">${leaderboardUrl}</a></p>`,
            });
          } catch (error) {
            console.error("Failed to send entry created email", {
              quizId,
              userId,
              entryId: savedEntry.id,
              error,
            });
          }
        }
      }

      await publishLeaderboardUpdated(context, quizId);
      return savedEntry as unknown as Entry;
    },
  },
};

export { EntryResolvers };