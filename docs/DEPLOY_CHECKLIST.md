# Deploy Checklist (Railway + Vercel)

Use this checklist when you have your Railway public URL.

## 0) Fill these values first

- `BACKEND_BASE_URL=https://<your-railway-domain>`
- `FRONTEND_BASE_URL=https://<your-vercel-domain>`

Examples:
- `BACKEND_BASE_URL=https://livequiz-api-production.up.railway.app`
- `FRONTEND_BASE_URL=https://livequiz.vercel.app`

## 1) Railway backend env vars (copy/paste)

Set these in Railway service settings:

- `HOST=0.0.0.0`
- `PORT=4000`
- `DATABASE_URL=<your prisma-hosted postgres connection string>`
- `CORS_ORIGINS=https://<your-vercel-domain>,https://www.<your-vercel-domain>`

Notes:
- If your Postgres provider requires SSL, include it in `DATABASE_URL` (for example `?sslmode=require`).
- Deploy uses `backend/railway.json` and runs:
  - `npm run migrate:deploy`
  - `npm run start:prod`

## 2) Vercel frontend env vars (copy/paste)

Set these in Vercel project settings (all environments you use):

- `NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://<your-railway-domain>/graphql`
- `NEXT_PUBLIC_GRAPHQL_WS_URL=wss://<your-railway-domain>/subscriptions`

Project settings:
- Root directory: `frontend`
- Install command: `npm i`
- Build command: `npm run build`

## 3) Release order

1. Deploy Railway backend.
2. Verify backend probes:
   - `https://<your-railway-domain>/health`
   - `https://<your-railway-domain>/graphql`
3. Set Vercel env vars with the same backend domain.
4. Deploy Vercel frontend.
5. Re-check Railway `CORS_ORIGINS` exactly matches frontend domain(s).

## 4) Smoke test (post-deploy)

1. Open frontend.
2. Create quiz (or open existing one).
3. Join from another browser/session.
4. Submit answer and confirm live leaderboard updates.

If realtime fails:
- Confirm `NEXT_PUBLIC_GRAPHQL_WS_URL` uses `wss://`.
- Confirm backend WebSocket endpoint is `/subscriptions`.
- Confirm `CORS_ORIGINS` includes deployed frontend origin.

## 5) Rollback quick path

- If frontend breaks, roll back Vercel to previous deployment.
- If backend breaks after migration/start, roll back Railway service deployment and review migration logs.