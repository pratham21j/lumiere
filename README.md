# Lumière

Lumière is an AI-powered entertainment discovery platform built with Next.js 15, TypeScript, Tailwind, shadcn/ui, Prisma, Neon Postgres, Auth.js, and a premium movie discovery experience.

## What’s included

- Polished marketing experience with responsive layouts and a dark premium UI
- Movie discovery rails: trending, popular, top-rated, upcoming, and search
- AI chat assistant with grounded recommendations and explanation
- Watchlist, collections, ratings, and personalized dashboard
- Production-ready structure with logging, rate limiting, and resilient fallbacks

## Phase 5 & 6 milestone

The current workspace includes the Phase 5 personalization experience and Phase 6 production hardening work:

- Personalized dashboard with taste profile insights
- Recent activity and watchlist/collection summaries
- AI-guided recommendations based on your interaction history
- Loading and error states for the dashboard experience
- Global fallback pages for unexpected errors and missing routes

## Screenshots

![Landing hero](shots/landing-hero.png)
![Browse experience](shots/p2-home.png)
![Movie detail experience](shots/p2-details-top.png)

## Local development

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up the environment

   ```bash
   cp .env.example .env.local
   ```

3. Run database migrations and seed data

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the app
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – create a production build
- `npm run lint` – run ESLint
- `npm run test` – run Vitest tests

## Architecture highlights

- Feature-based organization under src/features
- Prisma models for users, movies, watchlists, collections, and taste profiles
- Provider-based movie and AI abstraction for easy swap-in of TMDB/OpenAI implementations
