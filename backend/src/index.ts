import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { resolvers } from './graphql/resolvers/resolvers.js';
import { ResolverContext, createResolverContext } from './prisma.js';
import { typeDefs } from './graphql/utils.js';

const server = new ApolloServer<ResolverContext>({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests

const { url } = await startStandaloneServer<ResolverContext>(server, {
  listen: { port: 4000 },
  context: createResolverContext,
});

console.log(`🚀  Server ready at: ${url}`);