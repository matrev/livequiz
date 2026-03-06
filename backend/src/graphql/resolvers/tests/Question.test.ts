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

let mockQuestion = {
    id: 1,
    text: 'Test Question',
    quizId: 1,
    questionType: QuestionType.MultipleChoice,
    correctAnswer: 'Test Answer',
    options: [],
}

describe('Question Query resolver tests', () => {
  it('gets question by id', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockQuestion);
    const response = await server.executeOperation({
      query: `query testGetQuestionById {
        getQuestion(id: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
          options
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getQuestion).toEqual(mockQuestion);
  });

  it('checks if answer is correct', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockQuestion);
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
    mockContext.prisma.question.create.mockResolvedValue(mockQuestion);
    const response = await server.executeOperation({
      query: `mutation testCreateQuestion {
        createQuestion(text: "Test Question", questionType: MULTIPLE_CHOICE, correctAnswer: "Test Answer", quizId: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
          options
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.createQuestion).toEqual(mockQuestion);
    expect(response.body.singleResult.data?.createQuestion).toBeDefined();
  });

  it('creates a Question with options', async () => {
    const mockQuestionWithOptions = {
      ...mockQuestion,
      options: ['Option A', 'Option B', 'Option C'],
    };
    mockContext.prisma.question.create.mockResolvedValue(mockQuestionWithOptions);
    const response = await server.executeOperation({
      query: `mutation testCreateQuestionWithOptions {
        createQuestion(text: "MC Question", questionType: MULTIPLE_CHOICE, correctAnswer: "Option A", options: ["Option A", "Option B", "Option C"], quizId: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
          options
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.createQuestion).toEqual(mockQuestionWithOptions);
    expect(mockContext.prisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          options: ['Option A', 'Option B', 'Option C'],
        }),
      })
    );
  });

  it('deletes a Question', async () => {
    mockContext.prisma.question.delete.mockResolvedValue(mockQuestion);
    const response = await server.executeOperation({
      query: `mutation testDeleteQuestion {
        deleteQuestion(id: 1) {
          id
          quizId
          text
          correctAnswer
          questionType
          options
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.deleteQuestion).toEqual(mockQuestion);
    expect(response.body.singleResult.data?.deleteQuestion).toBeDefined();
  });

  it('updates a Question', async () => {
    mockContext.prisma.question.update.mockResolvedValue(mockQuestion);
    const response = await server.executeOperation({
      query: `mutation testUpdateQuestion {
        updateQuestion(id: 1, text: "Updated Test Question", correctAnswer: "Updated Test Answer") {
          id
          quizId
          text
          correctAnswer
          questionType
          options
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.updateQuestion).toEqual(mockQuestion);
    expect(response.body.singleResult.data?.updateQuestion).toBeDefined();
  });
});

describe('isQuestionCorrect for SHORT_ANSWER questions', () => {
  const mockShortAnswerQuestion = {
    id: 2,
    text: 'Short Answer Question',
    quizId: 1,
    questionType: QuestionType.ShortAnswer,
    correctAnswer: 'Paris',
    options: [],
  };

  it('returns true for an exact match', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockShortAnswerQuestion);
    const response = await server.executeOperation({
      query: `query testIsShortAnswerCorrectExact {
        isQuestionCorrect(questionId: 2, answer: "Paris")
      }`,
    }, { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.isQuestionCorrect).toBe(true);
  });

  it('returns true when answer differs only in case and whitespace', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockShortAnswerQuestion);
    const response = await server.executeOperation({
      query: `query testIsShortAnswerCorrectNormalized {
        isQuestionCorrect(questionId: 2, answer: "  paris  ")
      }`,
    }, { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.isQuestionCorrect).toBe(true);
  });

  it('returns true for a minor spelling mistake within the allowed threshold', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockShortAnswerQuestion);
    const response = await server.executeOperation({
      query: `query testIsShortAnswerCorrectFuzzy {
        isQuestionCorrect(questionId: 2, answer: "Pares")
      }`,
    }, { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.isQuestionCorrect).toBe(true);
  });

  it('returns false when the answer exceeds the spelling mistake threshold', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue(mockShortAnswerQuestion);
    const response = await server.executeOperation({
      query: `query testIsShortAnswerIncorrectFuzzy {
        isQuestionCorrect(questionId: 2, answer: "Bares")
      }`,
    }, { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.isQuestionCorrect).toBe(false);
  });

  it('throws an error when correctAnswer is null for a SHORT_ANSWER question', async () => {
    mockContext.prisma.question.findUnique.mockResolvedValue({
      ...mockShortAnswerQuestion,
      correctAnswer: null,
    });
    const response = await server.executeOperation({
      query: `query testIsShortAnswerNullCorrectAnswer {
        isQuestionCorrect(questionId: 2, answer: "Paris")
      }`,
    }, { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors?.[0].message).toBe(
      "Short answer question has no correct answer configured"
    );
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
          options
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