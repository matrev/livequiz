# LiveQuiz

LiveQuiz is a TypeScript-first realtime quiz platform.

## Frontend
## Quick start 
1. Install: npm i
2. Start dev server: npm run dev
3. Run tests: npm run test

Project layout (frontend/)
- src/app/ — Next.js pages and server components
- src/components/ — reusable React components
- src/utils/ — utility functions and hooks
- src/generated/ — auto-generated GraphQL types

Key design decisions
- Use Next.js App Router for server components and routing.
- Use Apollo Client for GraphQL data fetching and caching.
- Keep components small and focused on presentation; use hooks for logic.
- Use TypeScript strict mode for type safety.
- Type GraphQL queries and mutations with codegen to ensure type safety between API and UI.

Where to add things
- New pages → src/app/
- New components → src/components/
- New utilities → src/utils/

See docs/ARCHITECTURE.md and .github/copilot-instructions.md for Copilot-specific guidelines and example prompts.

## Backend (backend/)
## Quick start 
1. Install: npm i
2. Start dev server: npm run start
3. Run tests: npm run test

Project layout
- prisma/ — Prisma schema and migrations
- src/graphql/ — GraphQL schema and resolvers
- src/ — core domain logic and services
- */tests/ — unit and integration tests

Key design decisions
- Use Apollo Server for GraphQL API.
- Use Prisma ORM for database interactions.
- Keep domain logic in src/ and make resolvers thin adapters.
- Use TypeScript strict mode and explicit types for all public functions.
- Type GraphQL schema with codegen to ensure type safety between API and domain.

Where to add things
- New GraphQL resolvers → src/graphql/resolvers/
- New domain logic → src/
- New Prisma models → prisma/schema.prisma
- New tests → */tests/