# Developer & AI Agent Guidelines (.agents/AGENTS.md)

Welcome, AI Agent! This document is your comprehensive single source of truth for **Pandan App** (`project-meiyannnn1`). Read this file carefully to understand the project architecture, environment setup, coding conventions, quality standards, and execution workflows.

---

## 📌 Project Overview

**Pandan App** is a modern, responsive web application designed for real-time discovery of nearby food spots, restaurants, and culinary destinations.

- **Primary Features**:
  - 📍 **Geolocation Detection**: Automatic GPS location detection with manual search fallback ([geolocation.service.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/core/services/geolocation.service.ts)).
  - 🍔 **Nearby Places Query**: Google Places API integration for real-time restaurant search ([places.service.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/core/services/places.service.ts)).
  - ⚡ **Local Caching Layer**: In-memory and local storage caching to optimize Places API quotas ([cache.service.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/core/services/cache.service.ts)).
  - 🎯 **Advanced Food Filtering**: Filter by cuisine, distance, price level, rating, and open hours ([food-filter.service.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/features/nearby-food/services/food-filter.service.ts)).
  - 🍃 **3D Pandan Background**: Dynamic WebGL 3D Pandan leaf animations built with Three.js ([pandan-bg.component.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/features/nearby-food/components/pandan-bg/pandan-bg.component.ts)).
  - 🗺️ **Interactive Google Maps**: Map integration showing pins, info windows, and routes ([map.component.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/features/nearby-food/components/map/map.component.ts)).
  - 🔒 **Authentication System**: Gatekeeper auth service driven by environment config ([auth.service.ts](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/src/app/core/services/auth.service.ts)).

---

## 🛠️ Technology Stack & Environment Requirements

- **Framework**: Angular 19+ (Standalone Components, Signals, RxJS 7.8)
- **Node.js Runtime**: `v22.x` or higher (**Strictly required** by Angular CLI v22)
- **UI & Icons**: Angular Material (`@angular/material`), Angular CDK
- **3D Graphics Engine**: Three.js (`three` & `@types/three`)
- **Maps API**: Google Maps JavaScript API & Google Places API
- **Testing**: Karma / Jasmine unit testing, Jest (`setup-jest.ts`), Playwright E2E (`playwright.config.ts`)
- **Linting**: ESLint + `angular-eslint` (v22.1.0)
- **CI/CD**: GitHub Actions deploying to GitHub Pages (`.github/workflows/deploy.yml`)

---

## 🏛️ Project Architecture & Directory Layout

```
project-meiyannnn1/
├── .agents/
│   └── AGENTS.md                  # Comprehensive AI Agent Guidelines (THIS FILE)
├── scripts/
│   └── set-env.js                 # Dynamically generates environment TS files from .env
├── src/
│   ├── app/
│   │   ├── core/                  # Core singletons and business services
│   │   │   └── services/          # auth, places, geolocation, cache services
│   │   ├── features/              # Feature modules
│   │   │   └── nearby-food/       # Nearby food discovery feature
│   │   │       ├── components/    # food-card, filter-panel, map, pandan-bg, login-card
│   │   │       ├── pages/         # search-page component
│   │   │       ├── services/      # food-filter service
│   │   │       └── store/         # Signal-based FoodStore (food.store.ts)
│   │   └── shared/                # Shared utilities & presentation components
│   ├── assets/                    # Images, icons, static resources
│   ├── environments/              # Auto-generated (DO NOT edit manually!)
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                # Global design system & tokens
├── e2e/                           # Playwright end-to-end test scenarios
├── .github/workflows/deploy.yml   # GitHub Pages deployment pipeline (Node 22)
├── .env                           # Environment secret definitions (API keys, auth)
└── package.json                   # Dependencies, override resolutions, npm scripts
```

---

## 🔑 Environment Variable Safety Rules

> [!CRITICAL]
> **NEVER** edit generated environment files directly:
> - `src/environments/environment.ts`
> - `src/environments/environment.prod.ts`

### How Environment Setup Works:
1. Environment variables live exclusively in [.env](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/.env).
2. Key variables:
   - `GOOGLE_MAPS_API_KEY`: Key for Maps & Places API.
   - `APP_USERNAME`: Application access username.
   - `APP_PASSWORD`: Application access password.
3. Pre-build script [scripts/set-env.js](file:///c:/Workplace/PAIDChainGithub/rnd-python/project-meiyannnn1/scripts/set-env.js) parses `.env` and generates the TypeScript environment files.
4. To regenerate environments manually, execute `npm run config:env`.

---

## 🚨 Strict Code Quality & Linting Rules

When modifying Angular components (`*.ts`, `*.html`, `*.scss`), strictly enforce the following ESLint rules:

### 1. Strict Equality (`@angular-eslint/template/eqeqeq`)
- **ALWAYS** use strict equality operators (`!==`, `===`) in both HTML template expressions and TypeScript source code.
- **NEVER** use loose equality (`!=`, `==`).

### 2. Accessibility & Keyboard Handling (`@angular-eslint/template/click-events-have-key-events`, `interactive-supports-focus`)
- Any element with a `(click)` binding must be focusable (e.g. `<button>`, `<a>`, or `tabindex="0"`).
- Provide corresponding keyboard event listeners `(keyup)`, `(keydown)`, or `(keypress)` for non-native interactive elements.

### 3. Form Label Association (`@angular-eslint/template/label-has-associated-control`)
- Every `<label>` element must be explicitly linked to an input/select control using `for="<control-id>"` or by wrapping the control element.

### 4. No Empty Code Blocks (`no-empty`)
- Avoid empty functions or block statements `{}` in TypeScript files. Add meaningful comments or handling logic.

### 5. 3D WebGL Context Cleanup
- Three.js components (e.g., `PandanBgComponent`) **MUST** cleanly cancel `requestAnimationFrame`, dispose geometries, materials, textures, and clean up event listeners in `ngOnDestroy()`.

---

## 💻 CLI & Script Command Reference

All build and verification tasks must be run using Node `v22.x`:

| Task | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm start` | Launches Angular dev server at `http://localhost:4200/` |
| **Build App** | `npm run build` | Generates environment files & compiles production bundle |
| **Generate Env** | `npm run config:env` | Executes `scripts/set-env.js` |
| **Lint Code** | `npm run lint` | Runs `ng lint` (MUST output 0 errors before PR) |
| **Unit Tests** | `npm run test` | Executes Angular test suite via Karma/Jest |
| **E2E Tests** | `npm run e2e` | Runs Playwright tests |

---

## 🧪 Verification Protocol for AI Agents

Before declaring any task or feature complete:
1. Run `npm run lint` (or `cmd /c npm run lint` on Windows) and verify output is clean (**0 errors, 0 warnings**).
2. Run `npm run test` to verify unit test assertions.
3. Verify TypeScript compilation completes without errors (`npm run build`).
