# Project Structure Audit & Modernization Report

**Date:** 2025-12-04
**Project:** `verynice`
**Framework:** SvelteKit 2.x / Svelte 4.x

## 1. Overview
The project follows a standard SvelteKit structure. It is functional but requires organization improvements to meet "modern, multi-device" standards for scalability and maintainability.

## 2. Critical Findings

### 📂 Root Directory Clutter
**Observation:** The root directory contains 30+ `*_REPORT.md` and `*.json` files.
**Impact:** Makes navigation difficult and hides important config files.
**Recommendation:** Move all reports to a `reports/` directory.

### 📱 Multi-Device & PWA
**Observation:**
- ✅ Viewport meta tags are correct.
- ❌ Missing `manifest.json` (Required for "Add to Home Screen" on mobile).
- ❌ Missing `robots.txt` and `sitemap.xml` (Critical for SEO).
**Recommendation:**
- Create `static/manifest.json`.
- Create `static/robots.txt`.

### 🛣️ Routing Architecture
**Observation:** Routes are flat (`attractions`, `history`). No dynamic parameters visible at top level.
**Impact:** Limits ability to have individual pages for items (e.g., `/attractions/eiffel-tower`).
**Recommendation:** Adopt dynamic routing `[slug]` patterns for content-heavy sections.

### 🧩 Component Architecture
**Observation:** `src/lib/components` is organized by feature (`header`, `footer`). `ui-elements` contains complex widgets (`SocialShare`), not base elements.
**Recommendation:**
- Create `src/lib/components/ui` for base "atoms" (Button, Card, Input).
- Use Path Aliases (e.g., `$components/`) to simplify imports.

## 3. Detailed Action Plan

### Step 1: Cleanup
```bash
mkdir reports
mv *_REPORT.md reports/
mv *.json reports/
# Keep package.json, tsconfig.json, etc.
```

### Step 2: Configuration (Aliases)
Update `svelte.config.js` and `tsconfig.json` to support:
```typescript
// usage
import Button from '$components/ui/Button.svelte';
```

### Step 3: PWA Assets
Add `static/manifest.json`:
```json
{
  "name": "VeryNice App",
  "short_name": "VeryNice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [...]
}
```

### Step 4: Component Reorganization
Recommended Structure:
```text
src/lib/
├── components/
│   ├── ui/           # Base atoms (Button, Input)
│   ├── features/     # Complex blocks (Hero, Gallery)
│   └── layout/       # Header, Footer
├── utils/
└── stores/
```

## 4. Conclusion
The project is in a good state but needs "spring cleaning" and a shift towards a more atomic component structure to be truly "modern" and scalable.
