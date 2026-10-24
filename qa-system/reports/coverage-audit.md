# Angular AI QA & Living Manual — Master Coverage Audit

- **Scanned Root**: `src/app`
- **Total Components**: 10 (0 Missing or Shallow `toBeTruthy()` Stub)
- **Total Services**: 5 (0 Missing or Shallow `toBeTruthy()` Stub)
- **Total Route Feature Slices**: 1

## 1. Services Requiring Spec Upgrade & OpenAPI Contract Verification
| Service | Spec Status | HTTP Endpoints | Dependent Components |
| :--- | :--- | :--- | :--- |
| `auth` | **VERIFIED** | 0 | 2 |
| `cache` | **VERIFIED** | 0 | 1 |
| `geolocation` | **VERIFIED** | 0 | 1 |
| `places` | **VERIFIED** | 0 | 1 |
| `food-filter` | **VERIFIED** | 0 | 1 |

## 2. Components Requiring 9-Dimension Spec Upgrade
| Component | Spec Status | Template Branches | Events | Forms | RxJS Subs | Template Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `app` | **VERIFIED** | 0 | 0 | 0 | 0 | External |
| `empty-state` | **VERIFIED** | 7 | 1 | 0 | 0 | External |
| `filter-panel` | **VERIFIED** | 6 | 5 | 0 | 0 | External |
| `food-card` | **VERIFIED** | 12 | 2 | 0 | 0 | External |
| `loading` | **VERIFIED** | 0 | 0 | 0 | 0 | External |
| `login-card` | **VERIFIED** | 1 | 2 | 0 | 0 | External |
| `map` | **VERIFIED** | 0 | 0 | 0 | 0 | External |
| `mei-yan-banner` | **VERIFIED** | 4 | 5 | 0 | 0 | External |
| `pandan-bg` | **TRIAGED** | 0 | 0 | 0 | 0 | Inline |
| `search-page` | **VERIFIED** | 5 | 6 | 0 | 0 | External |