import { UserResolvers } from "./User.js";

const resolvers = {
  Query: {
    ...UserResolvers.Query,
  },
//   Mutation: {
//     ...FavoriteResolvers.Mutation,
//     ...AdminResolvers.Mutation,
//   },
};

export { resolvers };