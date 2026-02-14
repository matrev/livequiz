import { calculateLeaderboard } from "../Subscription.js";
import { MockContext, createMockContext } from "../../../../lib/tests/MockPrismaClient.js";

describe("Subscription - quizUpdated with Leaderboard", () => {
  let mockContext: MockContext;

  beforeEach(() => {
    mockContext = createMockContext();
  });

  describe("calculateLeaderboard", () => {
    it("should return empty leaderboard when no entries exist", async () => {
      mockContext.prisma.entry.findMany.mockResolvedValueOnce([]);

      const leaderboard = await calculateLeaderboard(1, mockContext as any);

      expect(leaderboard).toEqual([]);
    });

    it("should calculate correct answers for each user", async () => {
      const mockEntry = {
        id: 1,
        quizId: 1,
        authorId: 1,
        title: "User 1 Entry",
        answers: {
          "1": "optionA",
          "2": "optionB",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 1,
          email: "user1@example.com",
          name: "User One",
          isAdmin: false,
          entries: [],
        },
        quiz: {
          id: 1,
          title: "Sample Quiz",
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
          questions: [
            {
              id: 1,
              text: "Question 1",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionA",
              options: ["optionA", "optionB"],
            },
            {
              id: 2,
              text: "Question 2",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionC",
              options: ["optionA", "optionB", "optionC"],
            },
          ],
        },
      };

      mockContext.prisma.entry.findMany.mockResolvedValueOnce([mockEntry as any]);

      const leaderboard = await calculateLeaderboard(1, mockContext as any);

      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0]).toEqual({
        userId: 1,
        userName: "User One",
        correctAnswers: 1,
        totalQuestions: 2,
        score: 50,
      });
    });

    it("should sort leaderboard by score descending", async () => {
      const mockEntry1 = {
        id: 1,
        quizId: 1,
        authorId: 1,
        title: "User 1 Entry",
        answers: {
          "1": "optionA",
          "2": "optionA", // Wrong answer - should be optionB
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 1,
          email: "user1@example.com",
          name: "User One",
          isAdmin: false,
          entries: [],
        },
        quiz: {
          id: 1,
          title: "Sample Quiz",
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
          questions: [
            {
              id: 1,
              text: "Question 1",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionA",
              options: ["optionA", "optionB"],
            },
            {
              id: 2,
              text: "Question 2",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionB",
              options: ["optionA", "optionB"],
            },
          ],
        },
      };

      const mockEntry2 = {
        id: 2,
        quizId: 1,
        authorId: 2,
        title: "User 2 Entry",
        answers: {
          "1": "optionA",
          "2": "optionB",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 2,
          email: "user2@example.com",
          name: "User Two",
          isAdmin: false,
          entries: [],
        },
        quiz: {
          id: 1,
          title: "Sample Quiz",
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
          questions: [
            {
              id: 1,
              text: "Question 1",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionA",
              options: ["optionA", "optionB"],
            },
            {
              id: 2,
              text: "Question 2",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionB",
              options: ["optionA", "optionB"],
            },
          ],
        },
      };

      mockContext.prisma.entry.findMany.mockResolvedValueOnce([mockEntry1 as any, mockEntry2 as any]);

      const leaderboard = await calculateLeaderboard(1, mockContext as any);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].userName).toBe("User Two");
      expect(leaderboard[0].score).toBe(100);
      expect(leaderboard[1].userName).toBe("User One");
      expect(leaderboard[1].score).toBe(50);
    });

    it("should handle null answers gracefully", async () => {
      const mockEntry = {
        id: 1,
        quizId: 1,
        authorId: 1,
        title: "User 1 Entry",
        answers: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: 1,
          email: "user1@example.com",
          name: "User One",
          isAdmin: false,
          entries: [],
        },
        quiz: {
          id: 1,
          title: "Sample Quiz",
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
          questions: [
            {
              id: 1,
              text: "Question 1",
              quizId: 1,
              questionType: "MULTIPLE_CHOICE" as const,
              correctAnswer: "optionA",
              options: ["optionA", "optionB"],
            },
          ],
        },
      };

      mockContext.prisma.entry.findMany.mockResolvedValueOnce([mockEntry as any]);

      const leaderboard = await calculateLeaderboard(1, mockContext as any);

      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].correctAnswers).toBe(0);
      expect(leaderboard[0].score).toBe(0);
    });
  });
});
