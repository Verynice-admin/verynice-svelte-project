# API Reference

All endpoints are SvelteKit server routes under `/api/`. Every mutating endpoint enforces per-IP rate limiting backed by Firestore (see `src/lib/server/rateLimit.ts`).

Common error responses:

| Status | Meaning |
|---|---|
| 400 | Bad request — validation failed |
| 401 | Unauthorized — invalid or missing credentials |
| 404 | Resource not found |
| 429 | Rate limit exceeded — check `Retry-After` header (seconds) |
| 500 | Internal server error |
| 503 | Upstream service unavailable |

---

## Authentication

### `POST /api/auth/session`

Exchanges a Firebase client-side ID token for an HttpOnly session cookie.

**Rate limit:** 5 requests / 5 minutes per IP.

**Request body:**
```json
{ "idToken": "<Firebase ID token string>" }
```

**Success (200):**
```json
{ "success": true }
```
Sets `__session` cookie: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=432000` (5 days).

**Errors:**
- `400` — missing or malformed body / `idToken` not a string
- `401` — invalid or expired ID token
- `503` — Firebase Admin SDK not initialised

---

### `POST /api/auth/logout`

Clears the session cookie.

**Request body:** none

**Success (200):**
```json
{ "success": true }
```

---

### `POST /api/auth/delete-account`

Deletes the authenticated user's Firebase Auth account and Firestore user document.

Requires a valid session cookie.

**Success (200):**
```json
{ "success": true }
```

---

## Comments

### `POST /api/comments/submit`

Submits a user comment. The text is passed through AI moderation before writing to Firestore.

**Rate limit:** 10 requests / minute per IP.

**Request body:**
```json
{
  "postId": "string — alphanumeric + hyphens/underscores, 1–120 chars",
  "text":   "string — 1–1000 chars",
  "author": "string — optional, max 50 chars"
}
```

**Validation rules:**
- `postId` must match `/^[a-zA-Z0-9_-]{1,120}$/` — prevents Admin SDK namespace pollution
- `text` must be ≤ 1000 characters — mirrors Firestore security rule cap
- The target page document must exist in Firestore
- AI moderation must not flag the text as offensive

**Success (200):**
```json
{
  "success": true,
  "comment": {
    "text": "...",
    "author": "...",
    "createdAt": "<Firestore Timestamp>",
    "isAiCorrected": false
  }
}
```

**Moderation failure (400):**
```json
{
  "validationError": "Your comment was flagged as inappropriate.",
  "isOffensive": true
}
```

---

## Translation

### `POST /api/translate`

Translates an array of text segments into the target language using the AI fallback chain.

**Rate limit:** 30 requests / minute per IP.

**Request body:**
```json
{
  "targetLanguage": "French",
  "segments": [
    { "id": "seg-1", "text": "Hello world" },
    { "id": "seg-2", "text": "Welcome to Kazakhstan" }
  ]
}
```

**Constraints:**
- `targetLanguage` must be in the closed allowlist of ~100 supported language names (prevents prompt injection)
- `segments` is capped at 125 entries (additional entries are silently discarded)
- Segments with an empty `id` or `text` are filtered out

**Success (200):**
```json
{
  "translations": [
    { "id": "seg-1", "text": "Bonjour le monde" },
    { "id": "seg-2", "text": "Bienvenue au Kazakhstan" }
  ]
}
```

**Unsupported language (400):**
```json
{ "error": "Unsupported target language" }
```

---

## History Q&A

### `POST /api/history/ask-question`

Answers a question about Kazakhstan history / travel using AI, returning a conversational response and optional internal page links.

**Rate limit:** 20 requests / minute per IP.

**Request body:**
```json
{ "question": "When did Kazakhstan become independent?" }
```

**Constraints:**
- `question` must be a non-empty string, ≤ 500 characters

**Success (200):**
```json
{
  "success": true,
  "aiAnswer": "Kazakhstan declared independence on December 16, 1991...",
  "correctedQuestion": "When did Kazakhstan become independent?",
  "relatedLinks": [
    { "title": "History of Kazakhstan", "url": "/history" }
  ]
}
```

**Notes:**
- `relatedLinks` are filtered server-side: only root-relative paths (`/path`, not `//`, not `https://`) are returned, preventing LLM-hallucinated external or `javascript:` URLs
- `correctedQuestion` contains the AI's grammar/spelling correction of the original question

---

## Map Navigation

### `POST /api/map/navigate`

Resolves a natural-language place query to geographic coordinates.

**Rate limit:** 25 requests / minute per IP.

**Request body:**
```json
{ "query": "Charyn Canyon, Kazakhstan" }
```

**Constraints:**
- `query` must be a non-empty string, ≤ 200 characters

**Success (200):**
```json
{
  "success": true,
  "lat": 43.35,
  "lng": 79.08,
  "name": "Charyn Canyon"
}
```

**Not found (404):**
```json
{ "error": "Could not find location" }
```

---

## Weather

### `GET /api/weather`

Returns current weather conditions for a location using [Open-Meteo](https://open-meteo.com/) (no API key required).

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lng` | number | Longitude |

**Success (200):**
```json
{
  "temperature": 22,
  "windspeed": 15,
  "weathercode": 1,
  "time": "2026-05-25T12:00"
}
```

---

## Admin Endpoints

Admin endpoints require the `X-Admin-Token: <FIREBASE_ADMIN_TOKEN>` header (or `Authorization: Bearer <token>`).

In local development with `BYPASS_ADMIN_AUTH_IN_DEV=true` and requests from `localhost`, the token is not required.

### `POST /api/agent/generate-all`

Triggers batch AI generation of destination pages.

### `POST /api/admin/migrate-toc`

Migrates table-of-contents structure across Firestore documents.

### `POST /api/seed-*`

Seed endpoints for loading initial destination data into Firestore. Development use only.
