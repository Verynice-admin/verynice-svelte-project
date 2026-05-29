# VERYNICE.kz

A production SvelteKit travel guide for Kazakhstan — multilingual content, AI-powered translation and Q&A, role-based dashboards, Firebase backend.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 2 (Svelte 5) |
| Language | TypeScript (strict mode) |
| Deployment | Vercel (Node 20 serverless) |
| Database | Cloud Firestore (Admin SDK server-side, client SDK browser-side) |
| Auth | Firebase Auth → server-side session cookie (HttpOnly, Secure, SameSite=Strict) |
| AI | Groq → Gemini → OpenRouter (3-layer fallback) |
| Images | Cloudinary CDN + Unsplash/Pexels fallback |
| Maps | Leaflet + OpenStreetMap |
| Monitoring | Sentry (client + server) |
| Testing | Vitest + @testing-library/svelte |
| CI | GitHub Actions |

---

## Local Development

### Prerequisites

- Node.js ≥ 20 (`nvm use` picks up `.nvmrc` automatically)
- A Firebase project with Firestore and Authentication enabled
- API keys listed in `.env.example`

### Setup

```bash
# 1. Install dependencies (use ci for reproducible installs)
npm ci

# 2. Copy the environment template and fill in your values
cp .env.example .env

# 3. Firebase service account — choose one:
#    Option A (recommended): place serviceAccountKey.json in .secrets/
#    Option B: paste the full JSON as FIREBASE_SERVICE_ACCOUNT= in .env

# 4. Start the dev server
npm run dev
# → http://localhost:5173
```

### Dev Auth Bypass

To skip Firebase session cookie verification locally, add to `.env`:

```env
SKIP_AUTH_IN_DEV=true
DEV_USER_ROLE=traveller   # or: business
```

To skip admin token verification for seeding scripts:

```env
BYPASS_ADMIN_AUTH_IN_DEV=true
```

> **These flags are gated behind `NODE_ENV=development` AND `localhost` origin.**
> They are inert in any production environment — setting them in Vercel env vars has no effect.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PUBLIC_SENTRY_DSN` | No | Sentry DSN (safe to expose — embedded in client bundle) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name (client) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name (server) |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `FIREBASE_ADMIN_TOKEN` | Yes (prod) | Bearer token for admin API endpoints |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | Firebase service account JSON (single-line string) |
| `GROQ_API_KEY` | Yes | Primary AI provider |
| `GEMINI_API_KEY` | Yes | AI fallback 1 |
| `OPENROUTER_API_KEY` | Yes | AI fallback 2 |
| `PEXELS_API_KEY` | No | Stock photo fallback for generated pages |
| `UNSPLASH_ACCESS_KEY` | No | Stock photo fallback for generated pages |
| `SKIP_AUTH_IN_DEV` | No | `true` to bypass session auth locally |
| `DEV_USER_ROLE` | No | `traveller` or `business` when auth is bypassed |
| `BYPASS_ADMIN_AUTH_IN_DEV` | No | `true` to bypass admin token locally |

---

## Project Structure

```
src/
├── app.html                  # Root HTML, PWA manifest, CSP nonce placeholder
├── hooks.server.ts           # Security headers, Sentry, URL redirects, cache-control
├── hooks.client.ts           # Sentry client-side init
├── instrumentation.server.ts # Sentry server DSN (loaded before hooks)
├── service-worker.ts         # Offline caching, asset versioning
│
├── lib/
│   ├── firebase.ts           # Client Firebase init (lazy proxy, tree-shakeable)
│   ├── appConfig.ts          # Site config from Firestore with JSON fallback
│   ├── server/
│   │   ├── firebaseAdmin.ts  # Admin SDK init (service account or env var)
│   │   ├── sessionAuth.ts    # Session cookie verification + dev bypass
│   │   ├── apiAuth.ts        # Admin token verification (timing-safe compare)
│   │   ├── aiService.ts      # AI translation / moderation / Q&A (3-provider fallback)
│   │   ├── rateLimit.ts      # Per-IP rate limiting (Firestore + in-memory fallback)
│   │   ├── cache.ts          # In-memory TTL key/value cache
│   │   ├── logger.ts         # Structured logger (process.stdout/stderr, terser-safe)
│   │   └── agentPageGenerator.ts  # AI + stock photo destination page generator
│   ├── components/
│   │   ├── features/         # Search, comments, maps, gallery, weather, social
│   │   ├── layout/           # SiteHeader, Footer, AsideToc, navigation
│   │   └── ui/               # Button, Card, Input, LazyImage, OptimizedImage
│   ├── utils/
│   │   ├── sanitize.ts       # DOMPurify (browser) + regex strip (server) — XSS prevention
│   │   ├── markdown.ts       # Marked parser with custom renderer + sanitization
│   │   └── cloudinary.ts     # Cloudinary URL builder
│   └── stores/
│       ├── languageStore.ts  # Selected UI language
│       └── userStore.ts      # Authenticated user state
│
└── routes/
    ├── api/
    │   ├── auth/session/         # POST: Firebase ID token → session cookie (5-day)
    │   ├── auth/logout/          # POST: clear session cookie
    │   ├── auth/delete-account/  # POST: delete Firebase user + Firestore docs
    │   ├── comments/submit/      # POST: AI-moderated comment (rate-limited)
    │   ├── translate/            # POST: multi-language translation (125-segment cap)
    │   ├── history/ask-question/ # POST: AI Q&A about Kazakhstan
    │   ├── map/navigate/         # POST: AI coordinate/place lookup
    │   └── weather/              # GET: Open-Meteo current conditions
    ├── destinations/[slug]/      # Dynamic destination pages (10-min cache)
    ├── dashboard/
    │   ├── traveller/            # Trip management
    │   └── business/             # Listings, bookings, analytics, AI tools
    └── admin/content-audit/      # Content quality report (SSR disabled)
```

---

## Architecture

### Authentication Flow

```
Browser                        Server
  │                              │
  ├─ Firebase Auth (OAuth) ────► │
  ├─ POST /api/auth/session ───► verifyIdToken()
  │   { idToken }                fetch role from Firestore
  │                              setCustomUserClaims({ role })
  │ ◄── Set-Cookie __session ────┤ createSessionCookie() — 5-day expiry
  │                              │
  ├─ Any protected route ──────► verifyFirebaseSessionCookie(cookie, checkRevoked=true)
```

### AI Fallback Chain

```
Request → Groq (Llama 3.3 Versatile)
              └─[fail]─► Gemini 2.5 Flash Lite
                              └─[fail]─► OpenRouter (best available free model)
```

### Rate Limiting

Per-IP, per-scope buckets. Backed by Firestore transactions (strong consistency); falls back to an in-memory Map when Firestore is unavailable.

IP detection priority: `CF-Connecting-IP` → last entry of `X-Forwarded-For` → `X-Real-IP` → random anon key per request.

| Endpoint | Limit |
|---|---|
| `POST /api/auth/session` | 5 req / 5 min |
| `POST /api/comments/submit` | 10 req / min |
| `POST /api/translate` | 30 req / min |
| `POST /api/history/ask-question` | 20 req / min |
| `POST /api/map/navigate` | 25 req / min |

---

## Available Scripts

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Svelte type check (svelte-check)
npm run type-check   # TypeScript check (tsc --noEmit)
npm test             # Run full test suite
npm run test:ui      # Vitest browser UI
npm run lint         # ESLint
npm run format       # Prettier
npm run lighthouse   # Lighthouse CI audit
npm run analyze      # Bundle size visualizer
```

---

## Testing

Tests use [Vitest](https://vitest.dev/) + [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/).

```
tests/
├── setup.ts                   # jest-dom matchers
├── __mocks__/
│   ├── app-environment.ts     # SvelteKit $app/environment (browser=false)
│   └── app-navigation.ts      # SvelteKit $app/navigation stubs
├── components/
│   └── Button.test.ts
├── unit/
│   ├── cache.test.ts          # In-memory TTL cache
│   ├── sanitize.test.ts       # Server-side HTML sanitization (regex path)
│   └── rateLimit.test.ts      # Rate limiter in-memory fallback + IP detection
└── server/
    ├── translate.test.ts      # Translation API: validation, allowlist, rate limit
    ├── comments.test.ts       # Comments API: validation, AI moderation, rate limit
    └── history.test.ts        # History Q&A API: validation, URL safety, rate limit
```

All server tests mock Firebase Admin and AI services — **no credentials needed to run tests.**

```bash
npm test          # run once
npm run test:ui   # interactive watch mode
```

---

## Security

| Control | Implementation |
|---|---|
| CSP | `strict-dynamic` nonce-based (SSR) / hash-based (prerendered) via `svelte.config.js` |
| HSTS | `max-age=31536000; includeSubDomains; preload` |
| Clickjacking | `X-Frame-Options: DENY` |
| XSS | DOMPurify (browser) + ordered regex strip (server) in `sanitize.ts` |
| Session cookies | HttpOnly, Secure, SameSite=Strict, 5-day expiry |
| Token comparison | `timingSafeEqual` via `node:crypto` (no timing leak) |
| Prompt injection | Closed language allowlist in `/api/translate`; URL regex filter on AI-generated links |
| Rate limiting | Firestore-backed per-IP buckets with in-memory fallback |
| Firestore rules | Default-deny; owner-only editorial writes; counter-only public increments |
| Dependency CVEs | `npm audit --audit-level=high` on every CI push |

---

## Firestore Data Model

```
pages/{pageId}                  Public content (destinations, tips, history…)
  ├── comments/{commentId}      AI-moderated user comments
  └── {deep subcollections}     Attractions, articles, nested content

users/{userId}                  User profile (role, preferences)
  └── private/{docId}           Sensitive PII — UID-gated

_ratelimit/{scope:ip}           Rate limit buckets — server-only (Admin SDK)
```

### Security Rules Summary

| Collection | Read | Write |
|---|---|---|
| `pages/**` | Public | Owner only (verified email) |
| `pages/{id}` counter fields | — | Any (increment-by-1 only, no auth) |
| `pages/{id}/comments` | Public | Authenticated + field validation |
| `users/{uid}` | UID match | UID match |

---

## Firestore Backup

Firestore does not auto-backup on the Spark (free) plan. On Blaze, schedule managed exports:

```bash
# One-time export
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)

# Via Cloud Scheduler (recommended for production)
# https://firebase.google.com/docs/firestore/manage-data/export-import
```

For local snapshots with the emulator:

```bash
firebase emulators:export ./emulator-backup
firebase emulators:start --import=./emulator-backup
```

---

## CI/CD Pipeline

Every push and PR runs the full pipeline via GitHub Actions:

1. `npm run type-check` — TypeScript errors block the build
2. `npm run check` — Svelte template type errors block the build
3. `npm test -- --run` — All unit and server tests must pass
4. `npm run build` — Production build must succeed
5. `npm audit --audit-level=high` — High-severity CVEs block deployment

Vercel deploys automatically when the pipeline passes on `main`.

---

## Contributing

See [`.github/pull_request_template.md`](.github/pull_request_template.md) for the PR checklist.

**Branch strategy:** feature branches → PR to `main`. No direct pushes to `main`.
