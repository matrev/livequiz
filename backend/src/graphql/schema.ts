import { DateTimeResolver } from "graphql-scalars";

export const typeDefs = `#graphql
    scalar DateTime

    enum QuestionType {
        MULTIPLE_CHOICE
        TRUE_FALSE
        SHORT_ANSWER
    }

    type User {
        id: Int!
        email: String!
        isAdmin: Boolean!
        name: String
        entries: [Entry!]!
    }

    type Entry {
        id: Int!
        title: String!
        quiz: Quiz!
        quizId: Int!
        author: User!
        authorId: Int!
    }

    type Quiz {
        id: Int!
        title: String!
        questions: [Question!]!
        entries: [Entry!]!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type Question {
        id: Int!
        text: String!
        questionType: QuestionType!
        correctAnswer: String!
        quiz: Quiz!
        quizId: Int!
    }

    type Query {
        getAllUsers: [User!]!
        getUser(id: Int!): User
        getUsersForQuiz(quizId: Int!): [User!]!
        getAllQuizzes: [Quiz!]!
        getQuiz(id: Int!): Quiz
        getQuestionsByQuiz(quizId: Int!): [Question!]!
        getQuestion(id: Int!): Question
        isQuestionCorrect(questionId: Int!, answer: String!): Boolean!
    }

    type Mutation {
        createUser(email: String!, name: String!, isAdmin: Boolean): User!
        deleteUser(id: Int!): User!
        updateUser(id: Int!, email: String, name: String): User!
        createQuestion(text: String!, questionType: QuestionType!, correctAnswer: String!, quizId: Int!): Question!
        deleteQuestion(id: Int!): Question!
        updateQuestion(id: Int!, text: String, questionType: QuestionType, correctAnswer: String): Question!
        createQuiz(title: String!, questions: [String!]!): Quiz!
        updateQuiz(id: Int!, title: String, questions: [String!]): Quiz!
        addQuestionToQuiz(quizId: Int!, questionId: Int!): Quiz!
        removeQuestionFromQuiz(quizId: Int!, questionId: Int!): Quiz!
        deleteQuiz(id: Int!): Quiz!
    }

    type Subscription {
        quizUpdated(quizId: Int!): Quiz!
    }
`;