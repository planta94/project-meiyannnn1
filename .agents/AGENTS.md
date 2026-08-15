# Developer & AI Agent Handover Documentation (.agents/AGENTS.md)

Welcome! This document is the comprehensive single source of truth and **Detailed Handover Documentation** for **Pandan App** (`project-meiyannnn1`). Read this document thoroughly to understand the business domain, architecture, core services, state management, 3D WebGL engine, environment generator, code quality standards, and execution workflows.

---

## 📌 1. Project Overview & Business Domain

**Pandan App** is a specialized, responsive web application for real-time discovery of nearby authentic **Pandan food spots, desserts, chiffon cakes, waffles, kaya, and traditional kuih**.

### Core Business & Algorithmic Logic
- **Pandan Food Recognition**: Unlike generic restaurant search engines, Pandan App filters Google Places API results to display only authentic food and dessert establishments.
- **Township Name Disambiguation**: The word "Pandan" frequently occurs in Southeast Asian township and street names (e.g., *Pandan Indah*, *Pandan Perdana*, *Pandan Jaya*, *Pandan Valley*). The application implements algorithmic text cleaning to strip location names before keyword matching, preventing non-food businesses in these townships from being incorrectly tagged as Pandan food spots.
- **Non-Food Category Exclusion**: Automatically filters out non-culinary commercial establishments (clinics, pharmacies, hardware stores, auto repair, hair salons, laundries, dental clinics, banks, etc.).

---

## 🏛️ 2. Comprehensive System Architecture

### Directory & Component Breakdown

```
project-meiyannnn1/
├── .agents/
│   └── AGENTS.md                  # Comprehensive Handover Documentation (THIS FILE)
├── scripts/
│   └── set-env.js                 # Environment file generator script (parses .env)
├── src/
│   ├── app/
│   │   ├── core/                  # Core singletons and business services
│   │   │   └── services/
│   │   │       ├── auth.service.ts          # Auth gate & session expiration
│   │   │       ├── cache.service.ts         # 24h Quota-optimizing local cache
│   │   │       ├── geolocation.service.ts   # GPS detection & location fallback
│   │   │       └── places.service.ts        # Google Maps & Places API integration
│   │   ├── features/              # Feature modules
│   │   │   └── nearby-food/       # Pandan food search feature
│   │   │       ├── components/
│   │   │       │   ├── empty-state/        # Zero-results presentation
│   │   │       │   ├── filter-panel/       # Rating, open status & sort controls
│   │   │       │   ├── food-card/          # Food place item details card
│   │   │       │   ├── loading/            # Spinner overlay
│   │   │       │   ├── login-card/         # Preset credentials login modal
│   │   │       │   ├── map/                # Interactive Google Map view
│   │   │       │   ├── mei-yan-banner/     # Hero banner header component
│   │   │       │   └── pandan-bg/          # 3D Three.js WebGL leaf background
│   │   │       ├── pages/
│   │   │       │   └── search-page/        # Search view container page
│   │   │       ├── services/
│   │   │       │   └── food-filter.service.ts # Pandan food filtering & schedule parser
│   │   │       └── store/
│   │   │           └── food.store.ts       # Signal-based global reactive state
│   │   └── shared/                # Shared utilities & interfaces
│   │       └── models/
│   │           └── place.ts                # Place data domain model interface
│   ├── assets/                    # Static images and icons
│   ├── environments/              # Auto-generated (DO NOT edit manually!)
│   │   ├── environment.ts          # Development configuration
│   │   └── environment.prod.ts     # Production configuration
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                # Design system tokens & global SCSS
├── e2e/                           # Playwright end-to-end test scenarios
├── .github/workflows/deploy.yml   # GitHub Actions deployment pipeline (Node 22)
├── .env                           # Environment secret definitions (API keys, auth)
└── package.json                   # Dependencies, override resolutions, npm scripts
```

---

## ⚙️ 3. Core Services & Technical Implementation

### 3.1. Authentication Service ([auth.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/auth.service.ts))
- **Gatekeeper Access Control**: Protects Google Maps API initialization to prevent unauthenticated API quota consumption.
- **Environment Credentials**: Uses `environment.appUsername` and `environment.appPassword` (default fallbacks provided).
- **Session Token Management**: Persists authentication timestamp in `localStorage` under `pandan_auth_expiry` with a **240-hour (10-day) TTL**.
- **Reactive State**: Exposes `isAuthenticated = signal<boolean>(this.checkInitialAuth())`.

### 3.2. Geolocation Service ([geolocation.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/geolocation.service.ts))
- **Browser GPS Integration**: Wraps `navigator.geolocation.getCurrentPosition`.
- **Options & Timeout**: Configured with `enableHighAccuracy: true`, 10-second timeout, and 5-minute maximum age cache.
- **Error Handling**: Formats GPS rejection/denied errors into user-friendly diagnostic messages.

### 3.3. Google Places API Service ([places.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/places.service.ts))
- **Dynamic API Loader**: Injects the Google Maps JavaScript API script tag dynamically with `libraries=places,geometry,marker&v=weekly`.
- **Dual-Mode API Support**:
  1. **Modern Places API**: Uses `google.maps.places.Place.searchByText` when available for modern API compatibility.
  2. **Legacy PlacesService Fallback**: Gracefully falls back to `google.maps.places.PlacesService.nearbySearch` if modern classes are omitted in current script response.
- **Distance Computation**: Computes exact geodesic distance between user location and target place using `google.maps.geometry.spherical.computeDistanceBetween`, with Haversine formula fallback.

### 3.4. Cache Optimization Layer ([cache.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/cache.service.ts))
- **Quota & Cost Reduction**: Places API results are cached for **24 hours** (`CACHE_DURATION_MS = 86,400,000 ms`) across memory (`Map`) and browser `localStorage`.
- **Grid Precision Hashing**: Coordinates are rounded to **3 decimal places** (`~100m grid precision`). This maximizes cache hits for users searching within the same neighborhood or repeated sessions.
- **Versioned Keying & Invalidation**: Uses key prefix `pandan_cache_v2_`. Automatically cleans up legacy `v1` cache keys and invalidates entries containing missing or zeroed coordinates (`p.lat === 0`).

### 3.5. Food Filter & Schedule Parser ([food-filter.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/features/nearby-food/services/food-filter.service.ts))
- **Pandan Matching Algorithm**:
  1. `isPandanRelated(text)`: Replaces all occurrences of `PANDAN_LOCATION_PHRASES` with empty string before evaluating presence of `PANDAN_FOOD_KEYWORDS`.
  2. `filterPandanPlaces(places)`: Filters out establishments matching `NON_FOOD_KEYWORDS`.
  3. `removeDuplicates(places)`: Deduplicates results based on unique Google `place_id`.
- **Comprehensive Opening Hours Schedule Parser (`isPlaceOpenNow`)**:
  - Handles direct boolean properties (`openNow`, `open_now`).
  - Executes live `isOpen()` functions provided by Google Places response objects.
  - `evaluateOpenFromWeekdayText`: Parses text schedules (e.g., `"Monday: 8:00 AM – 6:00 PM"`), handling overnight shifts, 24-hour places, and timezone minutes calculation.
  - `evaluateOpenFromPeriods`: Evaluates structured Google Places period arrays (`{ open: { day, hour, minute }, close: { ... } }`).

### 3.6. Signal State Store ([food.store.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/features/nearby-food/store/food.store.ts))
- Built with Angular Signals (`signal<FoodState>`, `computed`).
- Manages: `currentLocation`, `radius` (default 1000m), `places`, `filteredPlaces`, `selectedPlace`, `loading`, `error`, and `sortedPlaces`.

### 3.7. 3D WebGL Background Component ([pandan-bg.component.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/features/nearby-food/components/pandan-bg/pandan-bg.component.ts))
- **Three.js Graphic Pipeline**: Renders 18 extruded 3D Pandan leaf meshes (`THREE.ExtrudeGeometry` with `THREE.Shape`) and 56 floating glowing mint particles (`THREE.Points`).
- **Mouse Parallax**: Smooth lerping mouse coordinates to control camera offset and ambient wave movement.
- **NgZone Optimization**: Animation loop (`animate()`) executes inside `this.ngZone.runOutsideAngular(() => ...)` to avoid triggering Angular change detection 60 times per second.
- **Strict Context Disposal**: `ngOnDestroy()` explicitly cancels `requestAnimationFrame` and calls `this.renderer.dispose()` to prevent WebGL memory leaks.

---

## 🔑 4. Environment Generator & Security Protocols

> [!CRITICAL]
> **NEVER** edit generated environment files directly:
> - `src/environments/environment.ts`
> - `src/environments/environment.prod.ts`

### Environment Build Flow:
1. All environmental secrets reside in the root [.env](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/.env) file:
   - `GOOGLE_MAPS_API_KEY`: API key for Places API & Maps SDK.
   - `APP_USERNAME`: Preset access username.
   - `APP_PASSWORD`: Preset access password.
2. The generator script [scripts/set-env.js](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/scripts/set-env.js) parses `.env` (or environment environment variables in CI/CD) and generates the corresponding TypeScript environment files.
3. Running `npm start` or `npm run build` automatically triggers `node scripts/set-env.js`.
4. To refresh environment files manually, execute `npm run config:env`.

---

## 🚨 5. Strict Code Quality & Linting Rules

When adding or modifying Angular components (`*.ts`, `*.html`, `*.scss`), strictly enforce the following ESLint rules:

### 1. Strict Equality (`@angular-eslint/template/eqeqeq`)
- **ALWAYS** use strict equality operators (`!==`, `===`) in both HTML templates and TypeScript files.
- **NEVER** use loose equality (`!=`, `==`).

### 2. Accessibility & Keyboard Handling (`@angular-eslint/template/click-events-have-key-events`, `interactive-supports-focus`)
- Any element with a `(click)` binding MUST be focusable (e.g. `<button>`, `<a>`, or `tabindex="0"`).
- Provide corresponding keyboard event listeners `(keyup)`, `(keydown)`, or `(keypress)` for non-native interactive elements.

### 3. Form Label Association (`@angular-eslint/template/label-has-associated-control`)
- Every `<label>` element must be explicitly linked to an input control using `for="<control-id>"` or by wrapping the control element.

### 4. No Empty Code Blocks (`no-empty`)
- Avoid empty functions or empty block statements `{}` in TypeScript files. Always add meaningful logic or explicit explanatory comments.

### 5. WebGL & Event Cleanup
- Three.js components MUST clean up animation loops, cancel `requestAnimationFrame`, dispose geometries/materials, and detach window resize/mousemove listeners in `ngOnDestroy()`.

---

## 💻 6. CLI Command & Execution Reference

All build, test, and lint commands must be run using Node `v22.x`:

| Task | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm start` | Generates environment files & launches dev server at `http://localhost:4200/` |
| **Build App** | `npm run build` | Generates environment files & compiles production bundle into `dist/` |
| **Generate Env** | `npm run config:env` | Manually executes `scripts/set-env.js` |
| **Lint Code** | `npm run lint` | Runs `ng lint` (MUST output **0 errors, 0 warnings** before PRs) |
| **Unit Tests** | `npm run test` | Executes unit tests via Jasmine / Karma / Jest |
| **E2E Tests** | `npm run e2e` | Runs Playwright end-to-end test scenarios |

---

## 🧪 7. AI Agent Verification Protocol

Before declaring any feature, fix, or refactoring complete:
1. Run `npm run lint` (or `cmd /c npm run lint` on Windows) and verify output is clean (**0 errors, 0 warnings**).
2. Run `npm run build` to verify TypeScript compilation succeeds without errors.
3. Run `npm run test` to verify unit test assertions pass.

---

## 🚀 8. CI/CD & Deployment Pipeline

- **GitHub Actions Workflow**: [.github/workflows/deploy.yml](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/.github/workflows/deploy.yml)
- **Node Runtime**: Node.js `22.x`
- **Build Steps**:
  1. Checkout repository.
  2. Install dependencies with `npm ci`.
  3. Execute `npm run build` (injecting `GOOGLE_MAPS_API_KEY`, `APP_USERNAME`, and `APP_PASSWORD` from repository secrets).
  4. Deploy generated `dist/` production artifacts to **GitHub Pages**.
