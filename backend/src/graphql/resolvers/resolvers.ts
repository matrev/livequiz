import { QuestionResolvers } from "./Question.js";
import { QuizResolvers } from "./Quiz.js";
import { UserResolvers } from "./User.js";

const resolvers = {
  DateTime: UserResolvers.DateTime,
  Query: {
    ...UserResolvers.Query,
    ...QuizResolvers.Query,
    ...QuestionResolvers.Query,
  },
  Mutation: {
    ...UserResolvers.Mutation,
    ...QuizResolvers.Mutation,
    ...QuestionResolvers.Mutation,
  },
};

export { resolvers };