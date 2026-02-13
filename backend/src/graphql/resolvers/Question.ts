import { PrismaContext } from "../../prisma.js";
import { QuestionType } from "../../../generated/graphql.js";
import { Resolvers, Question } from "../../../generated/graphql.js";

const QuestionResolvers: Resolvers = {
    Query: {
        getQuestion(_: any, args: { id: number }, context: PrismaContext) {
            const { id } = args;
            return context.prisma.question.findUnique({
                where: {
                    id,
                },
            }) as unknown as Question;
        },
        isQuestionCorrect(_: any, args: { questionId: number; answer: string }, context: PrismaContext) {
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
        async createQuestion(_: any, args: { text: string; questionType: QuestionType; correctAnswer?: string; quizId: number }, context: PrismaContext) {
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
        async deleteQuestion(_: any, args: { id: number }, context: PrismaContext) {
            const { id } = args;
            // Implementation for deleting a question by ID
            return context.prisma.question.delete({
                where: {
                    id,
                },
            }) as unknown as Question;
        },
        async updateQuestion(_: any, args: { id: number; text?: string; questionType?: QuestionType; correctAnswer?: string, options?: (string | null)[] }, context: PrismaContext) {
            const { id, text, questionType, correctAnswer, options } = args;
            // Implementation for updating a question by ID
            return context.prisma.question.update({
                where: {
                    id,
                },
                data: {
                    text,
                    questionType,
                    correctAnswer,
                    options: options ? options : undefined,
                },
            }) as unknown as Question;
        },
    }
}

export { QuestionResolvers };