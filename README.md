# Pandan App 🍃

A modern, responsive Web Application for discovering nearby food and restaurants using **Angular 19+**, **Google Places API**, and **Three.js** 3D visual effects.

---

## 🌟 Key Features

- 📍 **Geolocation Detection**: Automatically detects user coordinates or allows manual location searching.
- 🍔 **Nearby Food Discovery**: Real-time nearby restaurant and culinary spot discovery powered by Google Places API.
- 🎯 **Advanced Filtering**: Filter recommendations by cuisine, distance, price level, rating, and open status.
- 🗺️ **Interactive Maps**: Embedded Google Maps view to visualize restaurant locations and get directions.
- 🍃 **Dynamic 3D Aesthetics**: Immersive, interactive 3D Pandan leaf background crafted with **Three.js**.
- 🔒 **Authentication System**: Secure access gate configured via environment credentials.
- ⚡ **Caching Layer**: Intelligent local caching service (`CacheService`) to optimize place search requests and minimize API quota usage.

---

## 🛠️ Technology Stack

- **Framework**: [Angular 19+](https://angular.dev/) (Standalone Components, Signals, RxJS)
- **UI Components & Icons**: [Angular Material](https://material.angular.io/) & Angular CDK
- **3D Visuals**: [Three.js](https://threejs.org/)
- **Maps Integration**: Google Maps JavaScript API & Google Places API
- **Styling**: SCSS (Vanilla CSS / Design tokens)
- **Testing**: Jest, Karma & Jasmine, [Playwright](https://playwright.dev/) (E2E)
- **Linting & Quality**: ESLint & `angular-eslint`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v22.x` or higher (required by Angular CLI)
- **npm**: `v9.x` or higher
- **Google Maps API Key**: Requires Places API and Maps JavaScript API enabled.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/planta94/project-meiyannnn1.git
cd project-meiyannnn1
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root with your credentials:

```env
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
APP_USERNAME=meiyannnn1
APP_PASSWORD=YOUR_PASSWORD
```

> **Note**: Do not edit `src/environments/environment.ts` directly. The environment files are generated dynamically from `.env` prior to building or running dev servers.

Generate the environment config manually if needed:

```bash
npm run config:env
```

---

## 💻 Development Commands

| Command | Description |
| :--- | :--- |
| `npm start` | Launches the Angular dev server at `http://localhost:4200/` |
| `npm run build` | Generates environment files and compiles the production build to `dist/` |
| `npm run config:env` | Generates `environment.ts` and `environment.prod.ts` from `.env` |
| `npm run lint` | Runs `angular-eslint` checks across all source code |
| `npm run test` | Executes unit tests via test runner |
| `npm run e2e` | Runs Playwright end-to-end test suite |

---

## 📁 Architecture & Directory Structure

```
project-meiyannnn1/
├── .agents/               # AI agent configuration & instructions
├── scripts/
│   └── set-env.js         # Environment file generator script
├── src/
│   ├── app/
│   │   ├── core/          # Core services (Auth, Geolocation, Places, Cache)
│   │   ├── features/      # Feature modules (nearby-food search, components, store)
│   │   │   └── nearby-food/
│   │   │       ├── components/  # Food card, map, filter panel, pandan-bg (Three.js)
│   │   │       ├── pages/       # Search page view
│   │   │       ├── services/    # Food filter service
│   │   │       └── store/       # Food signal state store
│   │   └── shared/        # Shared components and utilities
│   ├── assets/            # Static assets and images
│   └── environments/      # Generated Angular environment configurations
├── e2e/                   # Playwright end-to-end test suites
├── eslint.config.js       # ESLint configuration
├── angular.json           # Angular CLI workspace config
└── package.json           # Node dependencies and npm scripts
```

---

## 🎨 Code Style & Quality Guidelines

- Use **Angular Standalone Components** for modularity.
- Ensure strict equality (`!==`, `===`) throughout template expressions and TypeScript code.
- Maintain accessible HTML standards (`@angular-eslint/template/accessibility` rules, interactive element focus, label associations).
- Run `npm run lint` before submitting PRs or commits.

---

## 📄 License

This repository is maintained for private / internal usage.
