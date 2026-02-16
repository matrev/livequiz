import { Resolvers, Quiz, Question, User, QuestionInput } from '../../../generated/graphql.js';
import { PrismaContext } from '../../prisma.js';
import { generateJoinCode } from '../../utils/generateJoinCode.js';

const QuizResolvers: Resolvers = {
    Query: {
        getAllQuizzes: (_: any, __: any, context: PrismaContext) => {
            return context.prisma.quiz.findMany({
                include: {
                    questions: true
                }
            }) as Promise<Quiz[]>;
        },
        getQuiz(_: any, args: { joinCode: string }, context: PrismaContext) {
            const { joinCode } = args;
            return context.prisma.quiz.findUnique({
                where: {
                    joinCode,
                },
                include: {
                    questions: true,
                }
            }) as unknown as Quiz | null;
        },
        getQuestionsForQuiz(_: any, args: { quizId: number }, context: PrismaContext) {
            const { quizId } = args;
            return context.prisma.question.findMany({
                where: {
                    quizId,
                },
            }) as Promise<Question[]>;
        },
        getUsersForQuiz(_: any, args: { quizId: number }, context: PrismaContext) {
            const { quizId } = args;
            return context.prisma.user.findMany({
                where: {
                    entries: {
                        some: {
                            quizId,
                        },
                    },
                },
            }) as Promise<User[]>;
        }
    },
    Mutation: {
        async createQuiz(_: any, args: { title: string; questions?: [QuestionInput]; deadline?: string }, context: PrismaContext) {
            const { title, questions = null, deadline } = args;
            const joinCode = generateJoinCode();
            
            const newQuiz: Quiz = await context.prisma.quiz.create({
                data: {
                    title,
                    joinCode,
                    deadline: deadline ? new Date(deadline) : null,
                    questions: {
                        createMany: {
                            data: [
                            ...questions
                        ]}
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),  
                }
            });
            return newQuiz;
        },
        async deleteQuiz(_: any, args: { id: number }, context: PrismaContext) {
            const { id } = args;
            return context.prisma.quiz.delete({
                where: {
                    id,
                },
            }) as unknown as Quiz;
        },
        async updateQuiz(_: any, args: { id: number; title?: string; questions?: any[] }, context: PrismaContext) {
            const { id, title } = args;
            return context.prisma.quiz.update({
                where: {
                    id,
                },
                data: {
                    title,
                    updatedAt: new Date(),
                },
            }) as unknown as Quiz;
        },
        async addQuestionToQuiz(_: any, args: { quizId: number; questionId: number }, context: PrismaContext) {
            const { quizId, questionId } = args;
            const quiz = await context.prisma.quiz.findUnique({
                where: { id: quizId },
            });
            if (!quiz) {
                throw new Error('Quiz not found');
            }
            const newQuestion = await context.prisma.question.update({
                where: { id: questionId },
                data: { quizId: quiz.id },
            }) as unknown as Quiz;
            // update quiz's questions list
            await context.prisma.quiz.update({
                where: { id: quizId },
                data: {
                    questions: {
                        connect: { id: questionId },
                    },
                },
            });
            return newQuestion;
        },
        async removeQuestionFromQuiz(_: any, args: { quizId: number; questionId: number }, context: PrismaContext) {
            const { quizId, questionId } = args;
            return context.prisma.question.deleteMany({
                where: {
                    id: questionId,
                    quizId,
                },
            }) as unknown as Quiz;
        }
    }
}

export { QuizResolvers };