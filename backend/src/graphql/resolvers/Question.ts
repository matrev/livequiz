import { prisma } from "../../prisma.js";
import { QuestionType } from "../../../generated/prisma/client.js";

const QuestionResolvers = {
    Query: {
        getQuestion(_: any, args: { id: number }) {
            const { id } = args;
            return prisma.question.findUnique({
                where: {
                    id,
                },
            });
        },
        getQuestionsByQuiz(_: any, args: { quizId: number }) {
            const { quizId } = args;
            return prisma.question.findMany({
                where: {
                    quizId,
                },
            });
        },
        isQuestionCorrect(_: any, args: { questionId: number; answer: string }) {
            const { questionId, answer } = args;
            return prisma.question.findUnique({
                where: {
                    id: questionId,
                },
            }).then((question) => {
                if (!question) {
                    throw new Error("Question not found");
                }
                return question.correctAnswer === answer;
            });
        }
    },
    Mutation: {
        async createQuestion(_: any, args: { text: string; questionType: QuestionType; correctAnswer: string; quizId: number }) {
            const { text, questionType, correctAnswer, quizId } = args;
            // Import Prisma QuestionType enum
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const {  } = require("@prisma/client");
            const newQuestion = await prisma.question.create({
                data: {
                    text,
                    questionType,
                    correctAnswer,
                    quizId,
                },
            });
            return newQuestion;
        },
        async deleteQuestion(_: any, args: { id: number }) {
            const { id } = args;
            // Implementation for deleting a question by ID
        },
        async updateQuestion(_: any, args: { id: number; text?: string; questionType?: string; correctAnswer?: string }) {
            const { id, text, questionType, correctAnswer } = args;
            // Implementation for updating a question by ID
        },
    }
}

export { QuestionResolvers };