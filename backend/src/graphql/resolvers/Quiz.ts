import { prisma } from '../../prisma.js';

const QuizResolvers = {
    Query: {
        getAllQuizzes() {
            return prisma.quiz.findMany();
        },
        getQuiz(_: any, args: { id: number }) {
            const { id } = args;
            return prisma.quiz.findUnique({
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
        }
    },
    Mutation: {
        async createQuiz(_: any, args: { title: string; questions: any[] }) {
            const { title, questions } = args;
            const newQuiz = await prisma.quiz.create({
                data: {
                    title,
                    questions: {
                        create: questions,
                    },
                },
                include: {
                    questions: true,
                },
            });
            return newQuiz;
        },
        async deleteQuiz(_: any, args: { id: number }) {
            const { id } = args;
            return prisma.quiz.delete({
                where: {
                    id,
                },
            });
        },
        async updateQuiz(_: any, args: { id: number; title?: string; questions?: any[] }) {
            const { id, title, questions } = args;
            return prisma.quiz.update({
                where: {
                    id,
                },
                data: {
                    title,
                    // Note: Updating questions would require more complex logic
                },
            });
        },
        async addQuestionToQuiz(_: any, args: { quizId: number; question: any }) {
            const { quizId, question } = args;
            const newQuestion = await prisma.question.create({
                data: {
                    ...question,
                    quizId,
                },
            });
            return newQuestion;
        },
        async removeQuestionFromQuiz(_: any, args: { quizId: number; questionId: number }) {
            const { quizId, questionId } = args;
            return prisma.question.deleteMany({
                where: {
                    id: questionId,
                    quizId,
                },
            });
        }
    },
    Subscription: {
        quizUpdated: {
            subscribe(_: any, args: { quizId: number }) {
                const { quizId } = args;
            }
        }
    }
}

export { QuizResolvers };