import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { PubSub } from 'graphql-subscriptions';
import { EmailSender } from './services/email/emailSender.js';
import { createEmailSenderFromEnv } from './services/email/createEmailSender.js';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });
const pubsub = new PubSub();
const emailSender = createEmailSenderFromEnv();

export interface ResolverContext {
 prisma: PrismaClient;
 pubsub: PubSub;
 emailSender: EmailSender;
}

export async function createResolverContext(): Promise<ResolverContext> {
 return { prisma, pubsub, emailSender };
}
