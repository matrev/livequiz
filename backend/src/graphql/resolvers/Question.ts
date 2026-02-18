import { ResolverContext } from "../../prisma.js";
import { QuestionType } from "../../../generated/graphql.js";
import { Resolvers, Question } from "../../../generated/graphql.js";
import { publishLeaderboardUpdated } from "../../utils/publishLeaderboardUpdated.js";

const QuestionResolvers: Resolvers = {
    Query: {
        getQuestion(_: any, args: { id: number }, context: ResolverContext) {
            const { id } = args;
            return context.prisma.question.findUnique({
                where: {
                    id,
                },
            }) as unknown as Question;
        },
        isQuestionCorrect(_: any, args: { questionId: number; answer: string }, context: ResolverContext) {
            const { questionId, answer } = args;
            return context.prisma.question.findUnique({
                where: {
                    id: questionId,
                },
            }).then((question) => {
                if (!question) {
                    throw new Error("Question not found");
                }
                return question.correctAnswer === answer;
            }) as unknown as boolean;
        }
    },
    Mutation: {
        async createQuestion(_: any, args: { text: string; questionType: QuestionType; correctAnswer?: string; quizId: number }, context: ResolverContext) {
            const { text, questionType, quizId, correctAnswer = null } = args;
            const newQuestion = await context.prisma.question.create({
                data: {
                    text,
                    questionType,
                    quizId,
                    correctAnswer
                },
            });
            return newQuestion as Question;
        },
        async deleteQuestion(_: any, args: { id: number }, context: ResolverContext) {
            const { id } = args;
            // Implementation for deleting a question by ID
            return context.prisma.question.delete({
                where: {
                    id,
                },
            }) as unknown as Question;
        },
        async updateQuestion(_: any, args: { id: number; text?: string; questionType?: QuestionType; correctAnswer?: string, options?: (string | null)[] }, context: ResolverContext) {
            const { id, text, questionType, correctAnswer, options } = args;
            // Implementation for updating a question by ID
            const updatedQuestion = await context.prisma.question.update({
                where: {
                    id,
                },
                data: {
                    text,
                    questionType,
                    correctAnswer,
                    options: options ? options : undefined,
                },
            });

            // publish only if answer key/scoring fields changed
            await publishLeaderboardUpdated(context, updatedQuestion.quizId);

            return updatedQuestion as Question;
        },
    }
}

export { QuestionResolvers };