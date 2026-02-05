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

it('returns all Users', async () => {
  mockContext.prisma.user.findMany.mockResolvedValue([
    mockUser
  ]);
  const response = await server.executeOperation({
    query: `query testGetAllUsers {
      getAllUsers {
        id
        name
        email
        isAdmin
      }
    }`,
  },
  { contextValue: mockContext });

  // Note the use of Node's assert rather than Jest's expect; if using
  // TypeScript, `assert`` will appropriately narrow the type of `body`
  // and `expect` will not.
  assert(response.body.kind === 'single');
  expect(response.body.singleResult.errors).toBeUndefined();
  expect(response.body.singleResult.data?.getAllUsers).toEqual([mockUser]);
  expect(response.body.singleResult.data?.getAllUsers).toBeDefined();
});