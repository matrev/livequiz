import { PrismaClient } from '../../generated/prisma/client.js';
import { PubSub } from 'graphql-subscriptions';
import { EmailSender } from '../../src/services/email/emailSender.js';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
  pubsub: DeepMockProxy<PubSub>;
  emailSender: DeepMockProxy<EmailSender>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    pubsub: mockDeep<PubSub>(),
    emailSender: mockDeep<EmailSender>(),
  };
};
