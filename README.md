# Trading Intelligence System (TradeMind)

An offline-first, local trading intelligence platform built with Next.js + TypeScript + Tailwind + Prisma + SQLite.

This app combines:
- Trading journal + performance analytics
- Daily tasks + weekly planning
- Diary/psychology tracking (mood/confidence/stress)
- Learning tracker + media library
- A unified roadmap-driven progression workflow (roadmap → weekly plan → tasks → reviews)

If you only want the shortest “run it now” guide, see [QUICK_START.md](QUICK_START.md).

## Quick start

```bash
cd "/home/nihal/Desktop/do it/trading-intelligence-system"
npm install
npm run dev
```

Open http://localhost:3000

## Key routes (UI)

| Area | Route |
|------|------:|
| Dashboard | `/` |
| Weekly planner | `/weekly-planner` |
| Daily tasks | `/daily-tasks` |
| Trades | `/trades` |
| Diary | `/diary` |
| Learning | `/learning` |
| Media | `/media` |
| Analytics | `/analytics` |
| Settings | `/settings` |
| Roadmap | `/roadmap` |

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (local file DB)
- Recharts (charts)
- lucide-react (icons)

Exact versions are in `package.json`.

## Architecture (high level)

### Frontend

- App Router pages live in `src/app/*/page.tsx`
- Layout/nav lives in `src/components/layout/*`
- Feature UIs live in `src/modules/*`

### Backend (server routes)

- API routes live under `src/app/api/**/route.ts`
- Data access goes through Prisma (`src/lib/db/prisma.ts`) and service modules (`src/services/*`)

### Unified progression workflow

The system is designed around a single source of truth:

Roadmap → Roadmap Tasks → (optional) Weekly Plan & Daily Tasks → Reviews/Reflections → Progress & Analytics

Deep dive: [UNIFIED_PROGRESSION_GUIDE.md](UNIFIED_PROGRESSION_GUIDE.md)

## Data model (Prisma)

All persistent storage is in SQLite via Prisma.

Core models (see `prisma/schema.prisma`):
- `Trade` — trades with P&L, strategy, emotions, notes
- `DailyTask` — dated tasks, optional link to a roadmap task
- `WeeklyPlan` — weekly focus/roadmap, optional link to a roadmap section
- `DiaryEntry` — mood/confidence/stress + freeform reflections
- `LearningLog` — topic/lesson progress and proficiency
- `MediaItem` — watch/read list + rating/review/lessons

Roadmap/progression models:
- `RoadmapSection` (week)
- `RoadmapTask` (day/task) with status + progress
- `RoadmapReview` (review/reflection for a roadmap task)
- `GeneratedWeeklyTask`, `GeneratedDailyTask`, `TaskReview` (generated tasks + review tracking)
- `RoadmapProgress` (global progress snapshot)

## Database & environment

The DB is configured by `DATABASE_URL` in `.env`.

Example:

```bash
DATABASE_URL="file:./database/trading_system.db"
```

Notes:
- `.env` is intentionally ignored by git.
- `*.db` files are ignored by git (your local data stays local).
- Use Prisma migrations in `prisma/migrations/` to recreate schema on a new machine.

## Commands

From the project root:

```bash
npm run dev      # start dev server
npm run build    # production build
npm start        # run production server
npm run lint     # lint

npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
```

Additional Prisma helpers:

```bash
npx prisma studio
npx prisma migrate reset
```

## API (routes)

All API routes are implemented in `src/app/api`.

### System
- `GET /api/system/status`

### Trades
- `GET /api/trades`
- `POST /api/trades`
- `GET /api/trades/:id`
- `PUT /api/trades/:id`
- `DELETE /api/trades/:id`

### Daily tasks
- `GET /api/daily-tasks`
- `POST /api/daily-tasks`
- `GET /api/daily-tasks/:id`
- `PUT /api/daily-tasks/:id`
- `DELETE /api/daily-tasks/:id`

### Diary
- `GET /api/diary`
- `POST /api/diary`
- `GET /api/diary/:id`
- `PUT /api/diary/:id`
- `DELETE /api/diary/:id`

### Learning
- `GET /api/learning`
- `POST /api/learning`
- `GET /api/learning/:id`
- `PUT /api/learning/:id`
- `DELETE /api/learning/:id`

### Media
- `GET /api/media`
- `POST /api/media`
- `GET /api/media/:id`
- `PUT /api/media/:id`
- `DELETE /api/media/:id`

### Weekly plans
- `GET /api/weekly-plans`
- `POST /api/weekly-plans`
- `GET /api/weekly-plans/:id`
- `PUT /api/weekly-plans/:id`
- `DELETE /api/weekly-plans/:id`

### Roadmap
- `GET /api/roadmap`
- `POST /api/roadmap`
- `POST /api/roadmap/init`
- `POST /api/roadmap/reset`
- `GET /api/roadmap/summary`

Roadmap tasks:
- `GET /api/roadmap/tasks/:id`
- `PATCH /api/roadmap/tasks/:id`
- `DELETE /api/roadmap/tasks/:id`
- `GET /api/roadmap/tasks/:id/review`
- `POST /api/roadmap/tasks/:id/review`
- `POST /api/roadmap/tasks/:id/mark-reviewed`

### Progression
- `GET /api/progression/stats`
- `POST /api/progression/generate-week`

### Analytics
- `GET /api/analytics`

## Storage / backups / exports

- Local backups live under `backups/`
- Exports live under `exports/`

The app is designed to keep user data local by default.

## Repo tour

Top-level:
- `src/` — app code
- `prisma/` — schema + migrations
- `database/` — local SQLite file location (not committed)

Important docs:
- [QUICK_START.md](QUICK_START.md) — day-to-day commands + navigation
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) — what was configured
- [UNIFIED_PROGRESSION_GUIDE.md](UNIFIED_PROGRESSION_GUIDE.md) — roadmap-driven progression
- [README_TRADINGMIND.md](README_TRADINGMIND.md) — product-style overview

## Privacy

This project is built to work offline and store data locally. No external analytics services are required for core functionality.
