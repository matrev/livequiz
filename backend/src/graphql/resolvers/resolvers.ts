import { QuestionResolvers } from "./Question.js";
import { QuizResolvers } from "./Quiz.js";
import { UserResolvers } from "./User.js";
import { EntryResolvers } from "./Entry.js";
import { SubscriptionResolvers } from "./Subscription.js";
import { Resolvers } from "../../../generated/graphql.js";
import { GraphQLJSON } from "graphql-scalars";

const resolvers: Resolvers = {
  JSON: GraphQLJSON,
  Query: {
    ...UserResolvers.Query,
    ...QuizResolvers.Query,
    ...QuestionResolvers.Query,
    ...EntryResolvers.Query,
  },
  Mutation: {
    ...UserResolvers.Mutation,
    ...QuizResolvers.Mutation,
    ...QuestionResolvers.Mutation,
    ...EntryResolvers.Mutation,
  },
  Subscription: {
    ...SubscriptionResolvers.Subscription,
  },
};

export { resolvers };