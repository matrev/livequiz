import { ApolloServer } from '@apollo/server';
import { resolvers } from '../resolvers.js';
import assert from 'node:assert/strict';
import { MockContext, createMockContext } from '../../../../lib/tests/MockPrismaClient.js';
import { User } from '../../../../generated/graphql.js';
import { typeDefs } from '../../utils.js';

let mockContext: MockContext;
let server: ApolloServer<MockContext>;

beforeEach(() => {
  mockContext = createMockContext();
  server = new ApolloServer<MockContext>({
    typeDefs,
    resolvers,
  });
})

let mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'testemail@email.com',
  isAdmin: false,
}

describe('Question Query resolver tests', () => {
  it('gets question by id', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    const response = await server.executeOperation({
      query: `query testGetQuestionById {
        getQuestion(id: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getQuestion).toEqual({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
  });

  it('checks if answer is correct', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    const response = await server.executeOperation({
      query: `query testIsQuestionCorrect {
        isQuestionCorrect(questionId: 1, answer: "Test Answer")
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.isQuestionCorrect).toBe(true);
  });
});

describe('Question Mutation resolver tests', () => {
  it('creates a Question', async () => {
    mockContext.prisma.question.create.mockResolvedValue({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    const response = await server.executeOperation({
      query: `mutation testCreateQuestion {
        createQuestion(text: "Test Question", questionType: MULTIPLE_CHOICE, correctAnswer: "Test Answer", quizId: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.createQuestion).toEqual({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    expect(response.body.singleResult.data?.createQuestion).toBeDefined();
  });

  it('deletes a Question', async () => {
    mockContext.prisma.question.delete.mockResolvedValue({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    const response = await server.executeOperation({
      query: `mutation testDeleteQuestion {
        deleteQuestion(id: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.deleteQuestion).toEqual({
      id: 1,
      quizId: 1,
      text: 'Test Question',
      correctAnswer: 'Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    expect(response.body.singleResult.data?.deleteQuestion).toBeDefined();
  });

  it('updates a Question', async () => {
    mockContext.prisma.question.update.mockResolvedValue({
      id: 1,
      quizId: 1,
      text: 'Updated Test Question',
      correctAnswer: 'Updated Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    const response = await server.executeOperation({
      query: `mutation testUpdateQuestion {
        updateQuestion(id: 1, text: "Updated Test Question", correctAnswer: "Updated Test Answer") {
          id
          quizId
          text
          correctAnswer
          questionType
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.updateQuestion).toEqual({
      id: 1,
      quizId: 1,
      text: 'Updated Test Question',
      correctAnswer: 'Updated Test Answer',
      questionType: 'MULTIPLE_CHOICE',
    });
    expect(response.body.singleResult.data?.updateQuestion).toBeDefined();
  });
});

describe('Question Query resolver edge cases', () => {
  it('returns null for non-existent question', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(null);
    const response = await server.executeOperation({
      query: `query testGetNonExistentQuestion {
        getQuestion(id: 999) {
          id
          quizId
          text
          correctAnswer
          questionType
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getQuestion).toBeNull();
  });

  it('throws error for isQuestionCorrect if question not found', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(null);
    const response = await server.executeOperation({
      query: `query testIsQuestionCorrectNonExistent {
        isQuestionCorrect(questionId: 999, answer: "Any Answer")
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors?.[0].message).toBe("Question not found");
  });
});