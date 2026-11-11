# Rebound — Tech Stack

Version 1.0. Versions are targets; pin exact versions in lockfiles at project start.

## 1. Summary
| Layer | Choice | Why |
|-------|--------|-----|
| Web client | Next.js 14 (App Router) + TypeScript (strict), PWA | SSR/ISR for fast first load, strong i18n, installable, one codebase |
| UI | Tailwind CSS, Radix UI primitives, shadcn/ui, lucide-react | Accessible primitives, fast iteration, RTL via logical properties |
| State/data | TanStack Query, Zustand (light UI state), Zod | Cache + optimistic updates, typed schemas shared with API client |
| i18n | next-intl (ICU) | RTL/LTR, plurals, locale routing |
| Charts | Recharts (+ accessible table fallbacks) | Simple, React-native, themeable |
| PWA/Push | Serwist (service worker), Web Push (VAPID) | Offline shell, nudges without app store |
| API | Python 3.11, FastAPI, Pydantic v2 | Typed contracts, OpenAPI for free, async I/O |
| ORM/migrations | SQLAlchemy 2.0, Alembic | Mature, supports RLS patterns |
| DB | PostgreSQL 16 (pgcrypto, RLS); optional TimescaleDB extension for signals | Relational + time-series; RLS for privacy |
| Cache/queue | Redis 7, ARQ (async worker) + APScheduler (cron triggers) | Light, fits FastAPI async |
| ML/sim | NumPy, SciPy, scikit-learn, lifelines/scikit-survival (hazard), custom Thompson sampler, Polars/Pandas | Small models, transparent, reproducible |
| LLM | Anthropic API (Claude) via `LLMAdapter`, JSON-schema outputs, template fallback | Structured output, swappable provider |
| Weather | Open-Meteo (no key) | City-level heat index |
| Messaging | Web Push, email (Resend or SMTP/Mailpit in dev), WhatsApp via adapter (stub → Twilio/Meta Cloud API) | Channel switching feature |
| Auth | Magic link (own implementation) + JWT; passkeys later | Low-friction onboarding |
| Observability | OpenTelemetry, structlog, Prometheus metrics, Sentry, Grafana (optional) | Auditability and ops |
| Testing | pytest, hypothesis, schemathesis, vitest, Testing Library, Playwright, axe-core, k6 | See testing-qa.md |
| CI/CD | GitHub Actions; Docker; Vercel (web), Render or Fly.io (API+worker), Neon/Supabase (Postgres), Upstash (Redis) | Fast deploys, free/low-cost tiers |
| IaC (later) | Terraform | Pilot hardening |

## 2. Frontend Details
- **Framework:** Next.js 14 App Router; route groups `(public)`, `(app)`, `(program)`; server components for static content, client components for interactive flows.
- **Styling:** Tailwind with design tokens as CSS variables (design.md §5); logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`) to support RTL without branches.
- **Components:** Radix Dialog, Popover, Tabs, Toggle, Slider; custom `LevelPicker`, `CapacityFaces`, `SurvivabilityGauge`, `WhyCard`, `ConsistencyRing`, `RecoveryTimeline`.
- **Forms:** React Hook Form + Zod resolver.
- **API client:** generated from OpenAPI (`openapi-typescript` + `openapi-fetch`).
- **Offline:** cached shell and today's plan; queued check-ins/logs sync when online (idempotency keys).
- **Audio mode:** `<audio>` with pre-generated clips; Web Speech API for optional voice input (feature-detected).
- **Accessibility tooling:** eslint-plugin-jsx-a11y, axe in Playwright, Storybook a11y addon (optional).

## 3. Backend Details
- **Layout:** modular monolith; packages per module (see architecture.md §3); each module exposes a service interface and a router; cross-module calls go through service interfaces and domain events.
- **Async:** FastAPI async endpoints; sync CPU-heavy code (simulation) runs in worker or thread pool (`anyio.to_thread`), with request-time budget and fallback to async job for long runs.
- **Validation/typing:** Pydantic v2 models; mypy strict on `domain/` and `governor/`.
- **Events:** in-process event bus + Postgres outbox table to guarantee delivery to worker.
- **Jobs:** ARQ worker; APScheduler triggers enqueue jobs; idempotency keys per job.
- **Config:** pydantic-settings; `.env` for local; secrets from platform secret store.
- **Security libs:** `pyjwt`, `passlib` not needed (passwordless), `cryptography` (AES-GCM), `slowapi`/custom Redis limiter.

## 4. Data & ML Details
- **Postgres extensions:** `pgcrypto`, `uuid-ossp` (or `gen_random_uuid()`), optional `timescaledb` for `signals`.
- **Feature pipeline:** SQL + Polars; features versioned (`feature_version` stored with each prediction).
- **Hazard model:** discrete-time logistic regression (scikit-learn) with calibration (isotonic); alt: Cox PH via lifelines for analysis.
- **Bandit:** Beta-Bernoulli Thompson sampling with hierarchical shrinkage; state persisted in `bandit_posteriors`.
- **Simulation:** NumPy vectorized; RNG via `numpy.random.Generator(PCG64(seed))`.
- **Differential privacy:** Laplace mechanism in-house (small, auditable); optional `diffprivlib` for cross-checking.
- **LLM prompts/schemas:** versioned in `prompts/`; golden tests in CI with recorded outputs and offline stubs.

## 5. Dev Environment
- **Repo:** monorepo (`apps/web`, `apps/api`, `packages/shared`, `docs/`).
- **Tooling:** pnpm workspaces, Turborepo (optional), uv or Poetry for Python, pre-commit (ruff, black, mypy, eslint, prettier, gitleaks).
- **Local run:** `docker compose up` (web, api, worker, postgres, redis, mailpit). Seed with `make seed` (synthetic users + 90 days of history).
- **Makefile targets:** `make dev`, `make test`, `make lint`, `make seed`, `make sim`, `make openapi`, `make e2e`.

## 6. Hosting & Environments
| Env | Web | API/Worker | DB | Redis |
|-----|-----|-----------|----|-------|
| local | `next dev` | uvicorn --reload / arq | Postgres container | Redis container |
| staging | Vercel preview | Render/Fly (1× each) | Neon branch | Upstash |
| demo/prod | Vercel prod | Render/Fly (2× API, 1× worker) | Neon/Supabase prod | Upstash |

Region: choose the closest region to pilot users that satisfies residency needs (review with counsel before pilot).

## 7. Alternatives Considered
| Decision | Alternative | Why not (MVP) |
|----------|------------|---------------|
| FastAPI | NestJS | Python is better for the ML/sim code in the same process |
| Postgres RLS | App-only checks | RLS gives defense in depth for privacy claims |
| ARQ | Celery | Heavier; async-first ARQ is enough |
| Next.js PWA | React Native | Faster to demo, no app-store friction, one codebase |
| In-house bandit | Vowpal Wabbit / RLlib | Transparent, small, easy to audit |
| Open-Meteo | Paid weather APIs | No key/cost for MVP |
| Recharts | D3 custom | Faster; D3 later for bespoke charts |

## 8. Version Targets
Node 20 LTS · pnpm 9 · Next 14.2 · React 18 · TypeScript 5.4 · Tailwind 3.4 · Python 3.11 · FastAPI 0.11x · Pydantic 2.x · SQLAlchemy 2.0 · Alembic 1.13 · Postgres 16 · Redis 7 · NumPy 1.26 · scikit-learn 1.4 · Playwright 1.4x.
