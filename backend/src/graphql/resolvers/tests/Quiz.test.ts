import { ApolloServer } from '@apollo/server';
import { resolvers } from '../resolvers.js';
import assert from 'node:assert/strict';
import { MockContext, createMockContext } from '../../../../lib/tests/MockPrismaClient.js';
import { typeDefs } from '../../utils.js';
import { QuestionType } from '../../../../generated/graphql.js';

let mockContext: MockContext;
let server: ApolloServer<MockContext>;

beforeEach(() => {
  mockContext = createMockContext();
  server = new ApolloServer<MockContext>({
    typeDefs,
    resolvers,
  });
})

const mockQuiz = {
    id: 1,
    title: 'Test Quiz',
    joinCode: 'ABCDEFGH',
    userId: 1,
    deadline: null,
    entries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [],
}

const mockQuestion = {
    id: 1,
    quizId: 1,
    text: 'Test Question',
    correctAnswer: 'Test Answer',
    options: [],
    questionType: QuestionType.MultipleChoice,
}

const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'testing@email.com',
    isAdmin: false,
}

describe('Quiz Query resolver tests', () => {
    it('returns all Quizzes', async () => {
        mockContext.prisma.quiz.findMany.mockResolvedValue([mockQuiz]);
        const response = await server.executeOperation({
            query: `query testGetAllQuizzes {
                getAllQuizzes {
                    id
                    title
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getAllQuizzes).toEqual([mockQuiz]);
        expect(response.body.singleResult.data?.getAllQuizzes).toBeDefined();
    });

    it('returns a Quiz by joinCode', async () => {
        mockContext.prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `query testGetQuizByJoinCode {
                getQuiz(joinCode: "ABCDEFGH") {
                    id
                    title
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.getQuiz).toBeDefined();
    });

    it('Gets questions for a Quiz', async () => {
        mockContext.prisma.question.findMany.mockResolvedValue([mockQuestion]);
        const response = await server.executeOperation({
            query: `query testGetQuestionsForQuiz {
                getQuestionsForQuiz(quizId: 1) {
                    id
                    quizId
                    correctAnswer
                    questionType
                    options
                    text
                }
            }`,
        },
        { contextValue: mockContext });

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getQuestionsForQuiz).toEqual([mockQuestion]);
        expect(response.body.singleResult.data?.getQuestionsForQuiz).toBeDefined();
    });

    it('Gets users for a Quiz', async () => {
        mockContext.prisma.user.findMany.mockResolvedValue([mockUser]);
        const response = await server.executeOperation({
            query: `query testGetUsersForQuiz {
                getUsersForQuiz(quizId: 1) {
                    id
                    name
                    email
                    isAdmin
                }
            }`,
        },
        { contextValue: mockContext });

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getUsersForQuiz).toEqual([
            {
                id: 1,
                name: 'Test User',
                email: 'testing@email.com',
                isAdmin: false,
            }
        ]);
        expect(response.body.singleResult.data?.getUsersForQuiz).toBeDefined();
    });

    it('Gets quizzes for a User', async () => {
        mockContext.prisma.quiz.findMany.mockResolvedValue([mockQuiz]);
        const response = await server.executeOperation({
            query: `query testGetQuizzesForUser {
                getQuizzesForUser(userId: 1) {
                    id
                    title
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getQuizzesForUser).toEqual([mockQuiz]);
        expect(response.body.singleResult.data?.getQuizzesForUser).toBeDefined();
    });
});


describe('Quiz Mutation resolver tests', () => {
    it('creates a Quiz', async () => {
        mockContext.prisma.quiz.create.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `mutation testCreateQuiz {
                createQuiz(title: "Test Quiz", userId: 1) {
                    id
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    title
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.createQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.createQuiz).toBeDefined();
    });

    it('deletes a Quiz', async () => {
        mockContext.prisma.quiz.delete.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `mutation testDeleteQuiz {
                deleteQuiz(id: 1) {
                    id
                    title
                    createdAt
                    updatedAt
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.deleteQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.deleteQuiz).toBeDefined();
    });

    it('updates a Quiz', async () => {
        mockContext.prisma.quiz.update.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `mutation testUpdateQuiz {
                updateQuiz(id: 1, title: "Updated Test Quiz") {
                    id
                    title
                    createdAt
                    updatedAt
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.updateQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.updateQuiz).toBeDefined();
    });

    it('adds questions to a Quiz', async () => {
        mockContext.prisma.quiz.update.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `mutation testAddQuestionsToQuiz {
                updateQuiz(id: 1) {
                    id
                    title
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.updateQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.updateQuiz).toBeDefined();
    });

    it('removes questions from a Quiz', async () => {
        mockContext.prisma.quiz.update.mockResolvedValue(mockQuiz);
        const response = await server.executeOperation({
            query: `mutation testRemoveQuestionsFromQuiz {
                updateQuiz(id: 1) {
                    id
                    title
                    deadline
                    entries {
                        id
                    }
                    joinCode
                    userId
                    questions {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.updateQuiz).toEqual(mockQuiz);
        expect(response.body.singleResult.data?.updateQuiz).toBeDefined();
    });

});