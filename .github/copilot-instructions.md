# Project: LiveQuiz

## Overview
The purpose of this project is to have a real-time quiz application where users can create quizzes and others can join and participate in them. The application will have a frontend built with React and Next.js and a backend built with Node.js using the Apollo Server. The database will be PostgreSQL with a Prisma ORM.

## Architecture
- Frontend: React, Next.js, TypeScript, Apollo Client
- Backend: Node.js, Apollo Server, TypeScript, Prisma
- Database: PostgreSQL, Prisma ORM

## Code Style & Conventions
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use async/await over promises
- File naming: camelCase for files, PascalCase for components

## Project Structure
- `/frontend/src/components` - React components
- `/backend/src` - API and business logic
- `/frontend/src//generated/types` - TypeScript type definitions
- `/frontend/src/utils` - Utility functions
- `/backend/src/graphql/resolvers` - GraphQL resolvers
- `/backend/src/graphql/schema` - GraphQL schema definitions

## Common Patterns
- The frontend will use Apollo Client for data fetching and state management.
- The backend will use Apollo Server for GraphQL API and Prisma for database interactions.
- State management uses React's built-in state and context API where necessary.
- Error handling uses try/catch with custom error types

## Testing
- Use Jest for unit tests
- Use React Testing Library for component tests
- Test files named: `*.test.ts` or `*.spec.ts`


# Primary goals for completions
- Prefer small, pure utility functions with strong TypeScript types.
- Use functional, immutable patterns for state updates in game logic.
- Use standardized error handling with Result<T, E>-like patterns (or throw only for programmer errors).
- Keep API surface minimal and well-typed.

# What to prefer
- Named exports for core domain types and functions.
- Explicit interfaces for domain models (e.g., Question, Player, Session).
- Use async/await and explicit Promise return types.
- Write small helper functions rather than large monoliths.

# What to avoid
- Avoid implicit any; always type public functions.
- Avoid mutating input parameters for game logic.
- Do not introduce global singletons; prefer dependency injection or passing context.

Project layout (important paths)
- src/domain/ — domain models and pure game logic
- src/services/ — adapters for real-time, storage, and REST
- src/web/ — API handlers and UI integration shims
- tests/ — unit + integration tests
- docs/ — human docs and examples

# Canonical patterns (examples)
- Use TS discriminated unions for event types (see src/domain/events.ts)
- Prefer pure functions in src/domain/* that accept state and return new state

# Examples and useful prompts
- "Implement a pure reducer to apply AnswerSubmitted events to SessionState given the scoring rules."
- "Create typed DTOs for API responses and add JSDoc examples."
- "Add unit tests showing edge cases for answer scoring and tie-breakers."

# Authoritative files to consult
- docs/ARCHITECTURE.md
- docs/EXAMPLES.md
- src/domain/README.md

# Important interfaces (examples to surface)
- Question: id, text, choices[], correctIndex, metadata
- Player: id, name, score
- Session: id, players[], currentQuestionId, history[]

If uncertain, prefer smallest change that preserves types and tests.

Example usage: when adding new game logic, add tests + JSDoc examples in the same PR so future Copilot suggestions match the pattern.
