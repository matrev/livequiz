import { PrismaClient } from '../../generated/prisma/client.js';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};
