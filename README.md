# EngLexa Backend

## Database migrations (VPS / production)

After deploy or schema changes, run from the `backend` directory:

```bash
npx prisma migrate deploy
```

Verify the live database matches `prisma/schema.prisma`:

```bash
npx prisma db pull
```

Compare the pulled schema with the repo. You should have **24** public tables matching all Prisma models (users, lessons, grammar_topics, skill_concept_mastery, user_daily_activity, etc.).

Docker entrypoint runs `prisma migrate deploy` automatically on container start.

## Grammar catalog data (Docker)

Catalog routes read JSON from `data/grammar/`. The production Docker image copies this folder to `/app/data/grammar/`.

## Phase 1 modules

| Module | Path | Notes |
|--------|------|-------|
| Core contracts | `src/modules/core/` | Shared interfaces |
| Grammar facade | `src/modules/grammar/` | File-based catalog + progress stubs |
| Content pipeline | `src/modules/content-pipeline/` | AI generation stubs (no real AI) |
| AI stubs | `src/modules/ai/` | Vocabulary + speaking stub routes |
| Legacy practice | `src/grammar-practice/` | Adaptive flow (`GET /grammar/:level/:topic`) |
