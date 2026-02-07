import { ApolloServer } from '@apollo/server';
import { resolvers } from '../resolvers.js';
import assert from 'node:assert/strict';
import { MockContext, createMockContext } from '../../../../lib/tests/MockPrismaClient.js';
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

let mockUser = {
  id: 1,
  name: 'Test User',
  email: 'testemail@email.com',
  isAdmin: false,
}

describe('User Query resolver tests', () => {
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

  it('returns a User by id', async () => {
    mockContext.prisma.user.findUnique.mockResolvedValue(mockUser);
    const response = await server.executeOperation({
      query: `query testGetUserById {
        getUser(id: 1) {
          id
          name
          email
          isAdmin
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getUser).toEqual(mockUser);
    expect(response.body.singleResult.data?.getUser).toBeDefined();
  });
});

describe('User Mutation resolver tests', () => {
  it('creates a User', async () => {
    mockContext.prisma.user.create.mockResolvedValue(mockUser);
    const response = await server.executeOperation({
      query: `mutation testCreateUser {
        createUser(name: "Test User", email: "testemail@email.com") {
          id
          name
          email
          isAdmin
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.createUser).toEqual(mockUser);
    expect(response.body.singleResult.data?.createUser).toBeDefined();
  });

  it('deletes a User', async () => {
    mockContext.prisma.user.delete.mockResolvedValue(mockUser);
    const response = await server.executeOperation({
      query: `mutation testDeleteUser {
        deleteUser(id: 1) {
          id
          name
          email
          isAdmin
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.deleteUser).toEqual(mockUser);
    expect(response.body.singleResult.data?.deleteUser).toBeDefined();
  });

  it('updates a User', async () => {
    const updatedUser = { ...mockUser, name: 'Updated Name' };
    mockContext.prisma.user.update.mockResolvedValue(updatedUser);
    const response = await server.executeOperation({
      query: `mutation testUpdateUser {
        updateUser(id: 1, name: "Updated Name") {
          id
          name
          email
          isAdmin
        }
      }`,
    },
    { contextValue: mockContext });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.updateUser).toEqual(updatedUser);
    expect(response.body.singleResult.data?.updateUser).toBeDefined();
  });
});