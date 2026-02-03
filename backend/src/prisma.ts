import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export interface PrismaContext {
 //add prisma context here
 prisma: PrismaClient;
}

export async function createPrismaContext(): Promise<PrismaContext> {
 return { prisma };
}
