# Nuviora

A mobile-optimized habit tracking and student productivity app built with Next.js, Prisma, and PostgreSQL.

## Overview
Nuviora helps users build habits through visual tracking (Daily, Monthly, Yearly views) and deep analytics. It includes a dedicated Classes daily tracker for students with gamification elements like XP, levels, and badges.

## Tech Stack
- **Framework**: Next.js (App Router) v16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn/UI components
- **State Management**: Zustand (with local storage persistence)
- **Database**: Prisma ORM + PostgreSQL (Replit built-in)
- **AI Coach**: Next.js API route powered by GPT (gpt-5-mini) via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL`), with a local rule-based fallback
- **Animations**: Framer Motion
- **Charts**: Recharts

## Architecture
- `src/app/` — Next.js App Router pages and API routes
- `src/app/page.tsx` — Main SPA entry point with tabbed navigation
- `src/app/api/` — Backend API routes (habits, PW study logs, analytics, stats, PDF export)
- `src/components/` — UI components (habits/, pw/, ui/)
- `src/stores/` — Zustand stores (habit-store.ts, pw-store.ts)
- `prisma/schema.prisma` — Database schema

## Database
Uses Replit's built-in PostgreSQL database. DATABASE_URL is managed as a Replit secret.

To sync schema changes: `npm run db:push`
To regenerate client: `npm run db:generate`

## Running
- Development: `npm run dev` (port 5000)
- Build: `npm run build`
- Start (production): `npm run start`

## Key Features
- Daily/Monthly/Yearly habit tracking with visual heatmaps
- PW (Physics Wallah) study tracker with class attendance + chapter completion map + doubt log
- Onboarding captures name, class (7–12), optional exam date, and PW vs Normal student mode
- Class 11/12 onboarding and Settings support stream selection (PCM, PCB, PCMB, Commerce, Humanities)
- Habit templates are filtered so class 11/12 stream packs only appear for users with that matching stream
- Home dashboard includes mobile-friendly stream widgets and stream habit suggestions
- Home dashboard now includes a daily study planner, exam roadmap, and weak subject detector powered by existing subject/mock-test data
- Subject tracker now supports chapter priority and a smart backlog tracker that ranks unfinished chapters
- Revision reminder now includes a 14-day revision calendar view
- Normal student mode hides PW tracking while keeping habit analytics available
- Gamification: XP levels, badges, XP level progression card in analytics
- Habit-based streaks: streaks are calculated automatically from days with at least one completed habit; there is no manual check-in flow
- Weekly Boss Challenge: auto-generated per-week challenge (Total Warrior, Iron Habit, etc.) with big coin rewards; tracked in `BossChallenge` model
- Aria AI coach: OpenAI-powered chat with Aria persona, persistent localStorage history (40-message memory), local fallback when no API key
- Weekly Debrief card: shown on Mondays only, cached per date in localStorage, dismissible; calls /api/weekly-debrief
- Mantra/Word-of-Month banner: user-set personal mantra shown on home dashboard; set in Settings
- Vacation Mode: date-range global streak freeze (separate from per-habit pause), stored in `vacationMode`/`vacationStart`/`vacationEnd` on UserProfile
- Changelog bell (What's New): bell icon in header opens modal with update history (ChangelogBell component)
- Shareable Stats Widget: StatsWidgetCard on home screen lets users share/copy current stats via native share API
- Subject color dots: colored dots on subject filter chips in Pomodoro focus screen and Flashcard screen (using `src/lib/subject-colors.ts`)
- Formula Vault: subject color dots, "Explain this" AI button with modal (calls /api/formulas/explain)
- Pet evolution milestones: confetti + level-up banner when pet levels up, with evolution path visible in the pet panel
- Hot streak flame indicator: 🔥 (3+ days), 🔥🔥 (7+ days), 🌋 (30+ days) shown on each habit card based on per-habit consecutive completion
- Focus/Pomodoro timer with ambient sounds (rain, cafe, whitenoise, forest, lo-fi)
- Focus mode shows a growing tree animation for class 11/12 students (tree grows as session progresses)
- Pomodoro session labels are filtered to user's selected subjects (not a hardcoded list)
- Reward shop has a confirmation dialog before redemption and a fixed top notification on success
- Store/Reward Shop includes one-time-use rewards, focus visuals, theme passes, cosmetics, and boosts with coin/level/streak/achievement unlock rules; consumables are redeemed but never equipped
- Classes Daily Tracker (formerly PW section) now shows "Classes Daily Tracker" in the header
- PW renamed to "Classes" throughout the UI (onboarding, settings)
- Habit templates auto-close after adding, and class 11/12 without stream shows a prompt to select stream
- Quick Focus widget has a single play/pause button (removed duplicate)
- Water intake tracking
- Mood logging
- Gratitude journal screen (/api/gratitude)
- Energy level tracker screen (/api/energy)
- Wellbeing & Reflection screen with a 9 PM rotating journal prompt, saved personal reflection log, exam milestone roadmap, weekly stress check-in trend graph, and female-only private Period Tracker with mandatory age setup, cycle settings, calendar phase indicators, ovulation/period predictions, and optional reminders (/api/reflections, /api/stress-checkins, /api/period)
- Topic timer screen (/api/topic-timer)
- AI summary screen (/api/ai-summary)
- Sleep tracker screen
- Holiday mode (pause streaks during dates) in Settings
- App PIN lock in Settings
- Weekly study goal + screen time goal in Settings
- New Year Reset button in Settings
- Quick Access horizontal scroll row on Home Dashboard (shortcuts to AI Plan, Flashcards, Formulas, Mock Tests, Challenges, Sleep, Gratitude, Energy, Focus)
- AI Daily Study Plan card in AI Summary screen (/api/ai-study-plan) — time-blocked plan for the rest of the day with fallback
- Subject-wise Focus Tracker on Pomodoro screen — bar chart breakdown by subject, 7/30-day toggle
- Advanced habit options: habit stacking, min viable version, conditional habits
- PDF export for study history (/api/habit-journal-pdf)
- Dark/light/system mode with next-themes + themed color palettes
- Loading screen now restores saved color theme and dark/light mode before React hydration so the splash screen matches the user's selected app theme after reopening
- Weekly email via Resend (RESEND_API_KEY secret)
- Username system: unique @username required at signup; existing users prompted on login; used for friend discovery
- Friends feature: add friends by @username, send/accept/reject requests, view friends' streaks/level/total habits; Friends tab in bottom nav
- New Prisma models: Friendship (userId, friendId, status: pending/accepted)
- New API routes: /api/friends (GET list, POST add), /api/friends/[id] (PATCH accept/reject, DELETE remove), /api/username-check (GET availability)
- Database: Replit built-in PostgreSQL (cloud, cross-device sync already works via server-side storage)
