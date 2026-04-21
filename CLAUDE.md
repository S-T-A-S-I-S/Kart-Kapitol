# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Kart Kapitol is a static, no-build-step website — a visitor-facing esports tourism portfolio for Marshalltown, Iowa. There is no package manager, bundler, framework, or test suite. Open the HTML files directly in a browser or serve them with any static file server.

```bash
# Serve locally (Python)
python -m http.server 8080

# Or with Node
npx serve .
```

## Architecture

### Content Flow

The site uses a two-layer content system:

1. **`content.json`** — the static baseline. All page copy, CTAs, card data, footer links, etc. live here.
2. **`localStorage` overrides** — the admin panel writes content changes to `localStorage` under the key `kartKapitolContentOverrides` (for page copy) and `kartKapitolDemoEvents` (for the events list).

`app.js` fetches `content.json` on every page load, then calls `mergeDeep()` to layer any localStorage overrides on top before calling `applyContent()`. This means the admin panel is purely client-side — no backend write access required.

### `app.js` — Shared Runtime

A single IIFE loaded on every page. Responsibilities:
- **Content hydration**: `loadContentFile()` → `applyContent()` binds content.json values to DOM elements via `id` selectors.
- **Events list**: `renderEventsList()` populates `#eventsList` from localStorage demo events or hardcoded fallbacks.
- **Navigation**: mobile nav open/close, keyboard escape handling, viewport resize auto-close.
- **Page transitions**: `#pageTransition` div fades in on internal link clicks (160ms), suppressed when `prefers-reduced-motion` is set.
- **Modals**: `[data-open-modal="key"]` triggers the `<dialog>` element using keys defined in the `modalContent` object in `app.js`.
- **Intro animation**: `runIntroAnimation()` triggers the `.kart-streak` CSS animation and `.brand-title.intro` class on the home page load.

### Admin / Auth Split

- **`login.html`** handles both real Firebase Auth (Google + email/password) and a demo bypass. The demo path sets `sessionStorage.kartKapitolDemoAdmin = "true"` and redirects to `admin.html?demo=1`.
- **`firebase.js`** exports `auth`, `db`, and `googleProvider` using Firebase v10 ESM CDN imports. It is only imported by `login.html` as a `type="module"` script.
- **`admin.html`** uses plain `<script>` (not module) for its admin logic, with a separate inline `type="module"` block only where Firebase imports are needed. The admin panel writes directly to localStorage — it does not write to Firestore.

### Styling

`styles.css` is the single stylesheet for all pages. It defines:
- CSS custom properties for the Marshalltown Tourism color palette (`--sky`, `--gold`, `--cobalt`, `--lime`, `--plum`, `--pink`, etc.) and a post-modern accent system that maps these to `--accent-1` through `--accent-6`.
- A dark-mode-only design (`--bg: #0b0f14`).
- Responsive breakpoints at `720px` (mobile nav) and `920px` (admin layout).

### Pages and `data-page`

Each HTML page sets `data-page` on `<body>` (e.g. `data-page="home"`, `data-page="exhibits"`). `app.js` reads this in `applyContent()` to apply the correct content.json section to `#page-title` and `#page-lead` on non-home pages.

### Modals

All modal content is hardcoded in the `modalContent` object in `app.js`. Trigger with `data-open-modal="key"` on any element. The `<dialog>` element and its `#modalTitle`/`#modalBody` targets must be present in the page HTML.

## Key Patterns

- **DOM selectors**: `app.js` uses a local `$` alias for `document.querySelector`. All content bindings use `id` attributes.
- **No innerHTML for user-controlled data**: admin inputs are written to localStorage and re-read as JSON; `applyContent()` uses `.textContent` for scalar fields. The cards/spotlights/gallery arrays use template literals with `innerHTML`, so those fields should not accept raw user HTML.
- **`content.json` is the source of truth** for baseline copy. localStorage overrides are demo-only and reset via the admin "Reset content overrides" button.
