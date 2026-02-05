import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server';

import { resolvers } from '../resolvers.js';
import assert from 'node:assert/strict';

const typeDefs = readFileSync('./src/graphql/schema.graphql', { encoding: 'utf8' });
it('returns all Questions', async () => {
    const testServer = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const response = await testServer.executeOperation({
        query: 'query getAllQuestions() {id text questionType correctAnswer quizId}',
    });

    // Note the use of Node's assert rather than Jest's expect; if using
    // TypeScript, `assert`` will appropriately narrow the type of `body`
    // and `expect` will not.
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.getAllQuestions).toBeDefined();
})