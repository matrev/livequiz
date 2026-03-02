import { Resolvers, Quiz, Question, User } from '../../../generated/graphql.js';
import { ResolverContext } from '../../prisma.js';
import { generateJoinCode } from '../../utils/generateJoinCode.js';

const QuizResolvers: Resolvers = {
    Query: {
        getAllQuizzes: (_: any, __: any, context: ResolverContext) => {
            return context.prisma.quiz.findMany({
                include: {
                    questions: {
                        orderBy: {
                            id: 'asc',
                        },
                    }
                }
            }) as Promise<Quiz[]>;
        },
        getQuiz(_: any, args: { joinCode: string }, context: ResolverContext) {
            const { joinCode } = args;
            return context.prisma.quiz.findUnique({
                where: {
                    joinCode,
                },
                include: {
                    questions: {
                        orderBy: {
                            id: 'asc',
                        },
                    },
                }
            }) as unknown as Quiz | null;
        },
        getQuestionsForQuiz(_: any, args: { quizId: number }, context: ResolverContext) {
            const { quizId } = args;
            return context.prisma.question.findMany({
                where: {
                    quizId,
                },
                orderBy: {
                    id: 'asc',
                },
            }) as Promise<Question[]>;
        },
        getUsersForQuiz(_: any, args: { quizId: number }, context: ResolverContext) {
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
        },
        getQuizzesForUser(_: any, args: { userId: number }, context: ResolverContext) {
            const { userId } = args;
            return context.prisma.quiz.findMany({
                where: {
                    entries: {
                        some: {
                            userId,
                        }
                    }
                },
            }) as Promise<Quiz[]>;
        },
    },
    Mutation: {
        async createQuiz(
            _: any,
            args: {
                title: string;
                userId: number;
                questions?: Question[] | null;
                deadline?: string | null;
                description?: string | null;
            },
            context: ResolverContext,
        ) {
            const { title, userId, questions = null, deadline, description } = args;
            const joinCode = generateJoinCode();
            
            const newQuiz: Quiz = await context.prisma.quiz.create({
                data: {
                    title,
                    description: description ?? null,
                    joinCode,
                    userId,
                    deadline: deadline ? new Date(deadline) : null,
                    questions: questions ? {
                        create: questions.map((q) => ({
                            text: q.text,
                            questionType: q.questionType,
                            correctAnswer: q.correctAnswer,
                            ...(q.options && { options: q.options }),
                        }))
                    } : undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),  
                },
                include: {
                    questions: true,
                }
            }) as unknown as Quiz;

            const quizOwner = await context.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true },
            });

            if (quizOwner?.email) {
                try {
                    const baseUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
                    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
                    const joinUrl = `${normalizedBaseUrl}/quiz/join/${newQuiz.joinCode}`;
                    const leaderboardUrl = `${normalizedBaseUrl}/quiz/leaderboard/${newQuiz.joinCode}`;
                    const editUrl = `${normalizedBaseUrl}/quiz/edit/${newQuiz.joinCode}`;
                    await context.emailSender.send({
                        to: quizOwner.email,
                        subject: `Your quiz "${newQuiz.title}" is ready`,
                        text: `Hi ${quizOwner.name}, your quiz "${newQuiz.title}" was created successfully.\n\nShare this link with participants so they can join and submit their answers:\n${joinUrl}\n\nShare this link so anyone can follow the live leaderboard:\n${leaderboardUrl}\n\nUse this private link to edit your quiz questions (keep it to yourself):\n${editUrl}`,
                        html: `<p>Hi ${escapeHtml(quizOwner.name ?? '')}, your quiz <strong>${escapeHtml(newQuiz.title)}</strong> was created successfully.</p><ul><li><strong>Participants join &amp; answer:</strong> <a href="${joinUrl}">${joinUrl}</a></li><li><strong>Live leaderboard:</strong> <a href="${leaderboardUrl}">${leaderboardUrl}</a></li></ul><p style="color:#999;font-size:0.85em;">Edit your quiz questions (private): <a href="${editUrl}" style="color:#999;">${editUrl}</a></p>`,
                    });
                } catch (error) {
                    console.error("Failed to send quiz created email", {
                        quizId: newQuiz.id,
                        userId,
                        error,
                    });
                }
            }

            return newQuiz;
        },
        async deleteQuiz(_: any, args: { id: number }, context: ResolverContext) {
            const { id } = args;
            return context.prisma.quiz.delete({
                where: {
                    id,
                },
            }) as unknown as Quiz;
        },
        async updateQuiz(_: any, args: { id: number; title?: string; description?: string; questions?: any[] }, context: ResolverContext) {
            const { id, title, description } = args;
            return context.prisma.quiz.update({
                where: {
                    id,
                },
                data: {
                    title,
                    description,
                    updatedAt: new Date(),
                },
            }) as unknown as Quiz;
        },
        async addQuestionToQuiz(_: any, args: { quizId: number; questionId: number }, context: ResolverContext) {
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
        async removeQuestionFromQuiz(_: any, args: { quizId: number; questionId: number }, context: ResolverContext) {
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