import { ApolloServer } from '@apollo/server';
import { resolvers } from '../resolvers.js';
import assert from 'node:assert/strict';
import { MockContext, createMockContext } from '../../../../lib/tests/MockPrismaClient.js';
import { typeDefs } from '../../utils.js';

let mockContext: MockContext;
let server: ApolloServer<MockContext>;

beforeEach(() => {
  mockContext = createMockContext();
  server = new ApolloServer<MockContext>({
    typeDefs,
    resolvers,
  });
});

const mockEntry = {
  id: 1,
  quizId: 1,
  userId: 1,
  name: 'Test Quiz',
  answers: { question1: 'answer1' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQuiz = {
  id: 1,
  title: 'Test Quiz',
  joinCode: 'TEST123',
  userId: 1,
  deadline: null,
  entries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [],
};

describe('Entry Mutation resolver - upsertEntry with deadline validation', () => {
  it('creates a new entry when quiz has no deadline', async () => {
    mockContext.prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
    mockContext.prisma.entry.findUnique.mockResolvedValue(null);
    mockContext.prisma.entry.create.mockResolvedValue(mockEntry);

    const response = await server.executeOperation({
      query: `mutation testUpsertEntry {
        upsertEntry(quizId: 1, userId: 1, name: "Test Quiz", answers: {question1: "answer1"}) {
          id
          quizId
          name
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(mockContext.prisma.entry.create).toHaveBeenCalled();
  });

  it('allows submission when deadline is in the future', async () => {
    const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const quizWithFutureDeadline = { ...mockQuiz, deadline: futureDeadline };

    mockContext.prisma.quiz.findUnique.mockResolvedValue(quizWithFutureDeadline);
    mockContext.prisma.entry.findUnique.mockResolvedValue(null);
    mockContext.prisma.entry.create.mockResolvedValue(mockEntry);

    const response = await server.executeOperation({
      query: `mutation testUpsertEntryBeforeDeadline {
        upsertEntry(quizId: 1, userId: 1, name: "Test Quiz", answers: {question1: "answer1"}) {
          id
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(mockContext.prisma.entry.create).toHaveBeenCalled();
  });

  it('rejects submission when deadline has passed', async () => {
    const pastDeadline = new Date(Date.now() - 1000 * 60 * 60);
    const quizWithPastDeadline = { ...mockQuiz, deadline: pastDeadline };

    mockContext.prisma.quiz.findUnique.mockResolvedValue(quizWithPastDeadline);

    const response = await server.executeOperation({
      query: `mutation testUpsertEntryAfterDeadline {
        upsertEntry(quizId: 1, userId: 1, name: "Test Quiz", answers: {question1: "answer1"}) {
          id
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors?.[0].message).toContain('Quiz deadline has passed');
    expect(mockContext.prisma.entry.create).not.toHaveBeenCalled();
  });

  it('throws error when quiz does not exist', async () => {
    mockContext.prisma.quiz.findUnique.mockResolvedValue(null);

    const response = await server.executeOperation({
      query: `mutation testUpsertEntryQuizNotFound {
        upsertEntry(quizId: 999, userId: 1, name: "Test Quiz", answers: {question1: "answer1"}) {
          id
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors?.[0].message).toContain('Quiz with id 999 not found');
  });

  it('allows update when deadline is in the future', async () => {
    const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const quizWithFutureDeadline = { ...mockQuiz, deadline: futureDeadline };

    mockContext.prisma.quiz.findUnique.mockResolvedValue(quizWithFutureDeadline);
    mockContext.prisma.entry.findUnique.mockResolvedValue(mockEntry);
    const updatedEntry = { ...mockEntry, answers: { question1: 'updated_answer' } };
    mockContext.prisma.entry.update.mockResolvedValue(updatedEntry);

    const response = await server.executeOperation({
      query: `mutation testUpdateEntry {
        upsertEntry(quizId: 1, userId: 1, name: "Test Quiz", answers: {question1: "updated_answer"}) {
          id
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(mockContext.prisma.entry.update).toHaveBeenCalled();
  });

  it('rejects update when deadline has passed', async () => {
    const pastDeadline = new Date(Date.now() - 1000 * 60 * 60);
    const quizWithPastDeadline = { ...mockQuiz, deadline: pastDeadline };

    mockContext.prisma.quiz.findUnique.mockResolvedValue(quizWithPastDeadline);
    mockContext.prisma.entry.findUnique.mockResolvedValue(mockEntry);

    const response = await server.executeOperation({
      query: `mutation testUpdateEntryAfterDeadline {
        upsertEntry(quizId: 1, userId: 1, name: "Test Quiz", answers: {question1: "updated_answer"}) {
          id
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors?.[0].message).toContain('Quiz deadline has passed');
    expect(mockContext.prisma.entry.update).not.toHaveBeenCalled();
  });
});

describe('Entry Query resolvers', () => {
  it('gets all entries', async () => {
    mockContext.prisma.entry.findMany.mockResolvedValue([mockEntry]);

    const response = await server.executeOperation({
      query: `query testGetAllEntries {
        getAllEntries {
          id
          quizId
          name
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getAllEntries).toBeDefined();
  });

  it('gets entry for user and quiz', async () => {
    mockContext.prisma.entry.findUnique.mockResolvedValue(mockEntry);

    const response = await server.executeOperation({
      query: `query testGetEntryForUser {
        getEntryForUser(quizId: 1, userId: 1) {
          id
          quizId
          name
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getEntryForUser).toBeDefined();
  });

    it('gets entries for quiz', async () => {
        mockContext.prisma.entry.findMany.mockResolvedValue([mockEntry]);
        const response = await server.executeOperation({
            query: `query testGetEntriesForQuiz {
                getEntriesForQuiz(quizId: 1) {
                    id
                    quizId
                    name
                }
            }`,
        },
        { contextValue: mockContext });

        assert(response.body.kind === 'single');
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.getEntriesForQuiz).toBeDefined();
    });
});
