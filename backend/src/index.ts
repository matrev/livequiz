import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { resolvers } from './graphql/resolvers/resolvers.js';
import { PrismaContext, createPrismaContext } from './prisma.js';

const typeDefs = readFileSync('./src/graphql/schema.graphql', { encoding: 'utf8' });

const server = new ApolloServer<PrismaContext>({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests

const { url } = await startStandaloneServer<PrismaContext>(server, {
  listen: { port: 4000 },
  context: createPrismaContext,
});

console.log(`🚀  Server ready at: ${url}`);