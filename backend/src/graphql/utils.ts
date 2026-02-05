import { readFileSync } from 'fs';

export const typeDefs = readFileSync('./src/graphql/schema.graphql', { encoding: 'utf8' });