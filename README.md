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

## Production env setup

Create env files from templates:
- Frontend: cp frontend/.env.example frontend/.env
- Backend: cp backend/.env.example backend/.env

Frontend variables (frontend/.env):
- NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://api.example.com/graphql
- NEXT_PUBLIC_GRAPHQL_WS_URL=wss://api.example.com/subscriptions

Backend variables (backend/.env):
- HOST=0.0.0.0
- PORT=4000
- CORS_ORIGINS=https://app.example.com,https://www.app.example.com
- EMAIL_PROVIDER=resend
- RESEND_API_KEY=<resend-api-key>
- EMAIL_FROM=no-reply@example.com

Alternative provider-agnostic HTTP mode:
- EMAIL_PROVIDER=http-api
- EMAIL_API_ENDPOINT=https://your-email-provider.example.com/send
- EMAIL_API_KEY=<provider-api-key>

Notes:
- Use wss:// for WebSocket subscriptions when frontend is served over HTTPS.
- In production, if CORS_ORIGINS is unset, backend denies browser origins by default.

## Hosting setup (Vercel Hobby + Railway)

Quick runbook: see `docs/DEPLOY_CHECKLIST.md` for copy-paste deployment values and rollout order.

This repo is ready to deploy with:
- Frontend on Vercel Hobby (project root: `frontend/`)
- Backend on Railway (single instance, project root: `backend/`)
- PostgreSQL from your existing hosted database via `DATABASE_URL`

Use these placeholders and replace them after Railway gives you a public URL:
- Backend base URL: `https://api-livequiz.example.com`
- Frontend base URL: `https://livequiz.example.com`

### 1) Deploy backend (Railway)

In Railway, create a service from this repo with root directory `backend`.

Environment variables:
- `HOST=0.0.0.0`
- `PORT=4000` (Railway may override this automatically)
- `DATABASE_URL=<your hosted postgres connection string>`
- `CORS_ORIGINS=https://livequiz.example.com,https://www.livequiz.example.com`
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=<resend-api-key>`
- `EMAIL_FROM=no-reply@example.com`

Optional generic HTTP mode instead of Resend:
- `EMAIL_PROVIDER=http-api`
- `EMAIL_API_ENDPOINT=https://your-email-provider.example.com/send`
- `EMAIL_API_KEY=<provider-api-key>`

Backend deploy behavior is configured in `backend/railway.json`:
- Runs migrations on deploy: `npm run migrate:deploy`
- Starts server: `npm run start:prod`
- Health probe path: `/health`

Important:
- Keep Railway builder as `RAILPACK`.
- Ensure the service root directory is `backend` so Railpack detects Node and `npm` correctly.

### 2) Deploy frontend (Vercel Hobby)

In Vercel, import this repo and set project root to `frontend`.

Set frontend environment variables:
- `NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://api-livequiz.example.com/graphql`
- `NEXT_PUBLIC_GRAPHQL_WS_URL=wss://api-livequiz.example.com/subscriptions`

Build command:
- `npm run build`

Install command:
- `npm i`

### 3) Rollout order

1. Deploy backend on Railway first.
2. Confirm backend URLs respond:
	- `https://api-livequiz.example.com/health`
	- `https://api-livequiz.example.com/graphql`
3. Set Vercel frontend env vars to that backend URL.
4. Deploy frontend on Vercel.
5. Update `CORS_ORIGINS` in Railway if frontend domain changes.

### 4) Smoke test after deploy

- Open frontend and create or join a quiz.
- Submit an answer from one client and observe live leaderboard updates on another.
- If subscriptions fail, verify `wss://.../subscriptions` and CORS origins.

### 5) Single-instance realtime note

Current subscriptions use in-memory PubSub, so realtime events are scoped to one backend instance. Keep Railway at a single instance for consistent behavior.