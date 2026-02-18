import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { PubSub } from 'graphql-subscriptions';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });
const pubsub = new PubSub();

export interface ResolverContext {
 prisma: PrismaClient;
 pubsub: PubSub;
}

export async function createResolverContext(): Promise<ResolverContext> {
 return { prisma, pubsub };
}
