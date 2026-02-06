
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./src/graphql/schema.graphql",
  generates: {
    "generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"]
    },
    "../frontend/src/graphql/": { 
      // Generates TypeScript types and React hooks for frontend,
      //  this will need to be updated when we deploy to have the frontend pull from the domain rather than local files
      preset: "client",
      plugins: [
        'typescript-operations',
        'typescript-react-apollo'
      ]
    }
  },
  config: {
    contextType: "../dist/src/index.js#PrismaContext"
  }

};

export default config;
