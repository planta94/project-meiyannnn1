# Pandan App 🍃

A modern, high-performance web application designed for real-time discovery of nearby authentic **Pandan culinary spots, desserts, chiffon cakes, and traditional kuih**. Built with **Angular 19+**, **Three.js** 3D WebGL visual effects, and **Google Places API**.

---

## 🌟 Key Features & Capabilities

- 📍 **Smart Geolocation & Search**: Automatically detects user coordinates via browser GPS with smooth fallback handling and distance radius calculations.
- 🍔 **Intelligent Pandan Food Filtering**: Advanced algorithm distinguishing genuine Pandan food items (chiffon cake, onde-onde, seri muka, kaya, waffle, cendol) from non-food locations (e.g. township names like *Pandan Indah*, *Pandan Jaya*) and non-food establishments (clinics, laundries, hardware stores).
- ⚡ **24-Hour Quota-Optimized Cache**: Custom local storage & memory caching layer ([cache.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/cache.service.ts)) with ~100m grid precision hashing to drastically reduce Google Places API requests and operational costs.
- 🍃 **Immersive 3D WebGL Background**: Dynamic, floating 3D Pandan leaf meshes and ambient particle animations powered by Three.js ([pandan-bg.component.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/features/nearby-food/components/pandan-bg/pandan-bg.component.ts)) running at 60fps outside Angular's `NgZone`.
- 🗺️ **Interactive Google Map & Cards**: Integrated Google Maps view displaying custom pins, selected place detail cards, open hours status, distance markers, and direct directions links.
- 🔒 **Access Gatekeeper & Auth System**: Reactive authentication service ([auth.service.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/core/services/auth.service.ts)) using environment-driven credentials with 240-hour session token persistence.

---

## 🛠️ Tech Stack & Framework Architecture

- **Frontend Framework**: [Angular 19+](https://angular.dev/) (Standalone Components, Angular Signals, RxJS 7.8)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) (Custom geometry extrusion & ambient particle system)
- **Maps & Location API**: Google Maps JavaScript API & Google Places API (New Places API `Place.searchByText` with legacy fallback)
- **UI Components & Styling**: Angular Material, Angular CDK & SCSS design system (Emerald & Dark Mode Glassmorphism)
- **State Management**: Reactive Signal-based Store ([food.store.ts](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/src/app/features/nearby-food/store/food.store.ts))
- **Environment & Build Utility**: Node.js environment generator ([set-env.js](file:///c:/Users/chine/OneDrive/Desktop/Github/project-meiyannnn1/scripts/set-env.js))
- **Testing & Quality Assurance**: ESLint (`angular-eslint`), Jasmine/Karma, Jest, and [Playwright](https://playwright.dev/) End-to-End testing

---

## 🚀 Quickstart & Installation

### Prerequisites

- **Node.js**: `v22.x` or higher (Strictly required by Angular CLI v22)
- **npm**: `v9.x` or higher
- **Google Maps API Key**: Key with **Places API**, **Maps JavaScript API**, and **Geocoding API** enabled.

### 1. Repository Setup

Clone the repository and install npm packages:

```bash
git clone https://github.com/planta94/project-meiyannnn1.git
cd project-meiyannnn1
npm install
```

### 2. Configure Environment Secrets

Create a `.env` file in the root directory:

```env
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
APP_USERNAME=meiyannnn1
APP_PASSWORD=YOUR_SECURE_PASSWORD
```

> [!WARNING]
> **Do NOT edit generated environment files directly** (`src/environments/environment.ts` or `src/environments/environment.prod.ts`).
> The pre-build script automatically parses `.env` and generates environment configuration files.

Manually trigger environment generation if needed:

```bash
npm run config:env
```

### 3. Launch Development Server

Start the local server:

```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser.

---

## 💻 NPM Command Reference

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm start` | Generates environment files & runs Angular dev server at `http://localhost:4200/` |
| **Build Production** | `npm run build` | Generates environment config & compiles production bundle into `dist/` |
| **Generate Env** | `npm run config:env` | Executes `scripts/set-env.js` to refresh TypeScript environments from `.env` |
| **Lint Code** | `npm run lint` | Runs `angular-eslint` verification across all component templates & TS files |
| **Unit Tests** | `npm run test` | Executes unit test suite using Karma / Jest |
| **E2E Tests** | `npm run e2e` | Launches Playwright automated end-to-end user scenarios |

---

## 🏛️ Directory Layout

```
project-meiyannnn1/
├── .agents/
│   └── AGENTS.md                  # Comprehensive Developer & Agent Handover Documentation
├── scripts/
│   └── set-env.js                 # Dynamic .env to environment.ts generator
├── src/
│   ├── app/
│   │   ├── core/                  # Core singletons (Auth, Places, Geolocation, Cache)
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── cache.service.ts
│   │   │       ├── geolocation.service.ts
│   │   │       └── places.service.ts
│   │   ├── features/              # Feature modules
│   │   │   └── nearby-food/       # Main Pandan discovery feature
│   │   │       ├── components/    # food-card, filter-panel, map, pandan-bg, login-card, etc.
│   │   │       ├── pages/         # search-page component
│   │   │       ├── services/      # food-filter.service.ts
│   │   │       └── store/         # Signal-based food.store.ts
│   │   └── shared/                # Shared interfaces, models & UI components
│   ├── assets/                    # Static assets & graphics
│   ├── environments/              # Auto-generated Angular environment files
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                # Global SCSS tokens, glassmorphism & theme
├── e2e/                           # Playwright end-to-end test scenarios
├── .github/workflows/deploy.yml   # GitHub Pages deployment pipeline
├── .env                           # Local environment configuration file
└── package.json                   # Dependencies, overrides, and scripts
```

---

## 🔒 Security & Code Standards

- **Environment Security**: Sensitive keys and application passwords stay in `.env` and are excluded from git index (`.gitignore`).
- **Template Equality Rules**: Strict equality (`===`, `!==`) enforced across all Angular component templates.
- **Accessibility & ARIA**: Mandatory focus management and keyboard handling on interactive template bindings.
- **3D Memory Management**: WebGL contexts, geometries, materials, and animation frames are strictly disposed on `ngOnDestroy()`.

---

## 📄 License & Maintenance

This repository is maintained for private internal usage under `planta94/project-meiyannnn1`.
