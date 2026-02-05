import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { addMocksToSchema } from '@graphql-tools/mock';
import { resolvers } from '../resolvers.js';
import { PrismaContext } from '../../../prisma.js';
import assert from 'node:assert/strict';

// const mockServer = new ApolloServer<PrismaContext>({
//   schema: addMocksToSchema({
//     schema: makeExecutableSchema({ typeDefs, resolvers }),
//     preserveResolvers: true,
//   })
// });

const typeDefs = readFileSync('./src/graphql/schema.graphql', { encoding: 'utf8' });

it('returns all Users', async () => {
  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const response = await testServer.executeOperation({
    query: 'query getAllUsers {id name email isAdmin}',
  });

  // Note the use of Node's assert rather than Jest's expect; if using
  // TypeScript, `assert`` will appropriately narrow the type of `body`
  // and `expect` will not.
  assert(response.body.kind === 'single');
  expect(response.body.singleResult.errors).toBeUndefined();
  expect(response.body.singleResult.data?.getAllUsers).toBeDefined();
});

// it('returns hello with the default name when no name is provided', async () => {
//   const testServer = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   const response = await testServer.executeOperation({
//     query: 'query SayHelloWorld { hello }',
//   });

//   assert(response.body.kind === 'single');
//   expect(response.body.singleResult.errors).toBeUndefined();
//   expect(response.body.singleResult.data?.hello).toBe('Hello there!');
// });