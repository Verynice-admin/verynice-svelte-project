# Changelog

All notable changes to VERYNICE.kz are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### Added
- Structured server-side logger (`src/lib/server/logger.ts`) using `process.stdout/stderr` — terser-safe, JSON-formatted, routed to Vercel function log stream
- Comprehensive test suite: unit tests for `cache`, `sanitize`, `rateLimit`; server API tests for `translate`, `comments`, `history` endpoints
- Test mocks for SvelteKit virtual modules (`$app/environment`, `$app/navigation`)
- `docs/api.md` — full API reference for all server endpoints
- `README.md` — architecture overview, environment variable reference, security summary, data model, CI/CD description
- `CHANGELOG.md` (this file)
- `.github/pull_request_template.md` — standard PR checklist
- `.github/CODEOWNERS` — review routing

### Changed
- CI pipeline (`ci.yml`): added `npm test -- --run` step; made `svelte-check` blocking (removed `continue-on-error: true`)
- `rateLimit.ts`: replaced `console.log` rate-limit-exceeded events with `logger.warn` (previously stripped by Terser in production)
- `rateLimit.ts`: replaced `console.error` Firestore fallback warning with `logger.error`
- `api/auth/session`: replaced `console.log` auth events and `console.error` claim errors with `logger.info`/`logger.error`
- `api/comments/submit`: replaced `console.error`/`console.warn` with `logger.error`/`logger.warn`
- `api/translate`: replaced `console.error` with `logger.error`
- `api/history/ask-question`: replaced `console.error` with `logger.error`
- `api/map/navigate`: replaced `console.log` debug log and `console.error` with `logger.debug`/`logger.error`

### Fixed
- Rate-limit-exceeded events were silently dropped in production (Terser `drop_console:true` stripped `console.log`). Fixed by routing through `logger.warn` which uses `process.stderr.write`.

---

## [0.1.0] — 2026-05-01 (estimated)

### Added
- Initial SvelteKit project with Vercel adapter
- Firebase Auth + Firestore backend
- Multilingual AI translation (Groq → Gemini → OpenRouter fallback)
- AI comment moderation
- AI Q&A for Kazakhstan history
- Destination pages with Firestore-backed attraction data
- Role-based dashboards: traveller (trips) and business (listings, bookings, analytics)
- Rate limiting: per-IP Firestore-backed buckets with in-memory fallback
- DOMPurify + server-side regex sanitization
- CSP with `strict-dynamic`, HSTS, X-Frame-Options, Referrer-Policy security headers
- Sentry error tracking (client + server)
- Lighthouse CI with strict performance/accessibility/SEO thresholds
- Service worker for offline caching
- Cloudinary image optimization
- Dependabot weekly npm update automation
