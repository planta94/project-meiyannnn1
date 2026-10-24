# Incremental QA & User Manual Impact Plan

- **Compared Against**: `e84b25ad6b622d6d853b8ca246c16357efea3b85`
- **Changed Files Detected**: 10
- **OpenAPI Contract Changed**: No
- **i18n Translations Changed**: No

## 1. Impacted Unit Specs (`.spec.ts`) to Update/Run
- [Component] `src/app/features/nearby-food/components/empty-state/empty-state.component.spec.ts` (Status: **VERIFIED**)
- [Component] `src/app/features/nearby-food/components/filter-panel/filter-panel.component.spec.ts` (Status: **VERIFIED**)
- [Component] `src/app/features/nearby-food/components/food-card/food-card.component.spec.ts` (Status: **VERIFIED**)
- [Component] `src/app/features/nearby-food/components/loading/loading.component.spec.ts` (Status: **VERIFIED**)
- [Component] `src/app/features/nearby-food/components/map/map.component.spec.ts` (Status: **VERIFIED**)
- [Component] `src/app/features/nearby-food/pages/search-page/search-page.component.spec.ts` (Status: **VERIFIED**)

## 2. Impacted Playwright E2E Journeys & Manual Chapters
- [Route `/`] E2E: `e2e/tests/nearby-food.e2e.spec.ts` -> Manual Chapter: `nearby-food`

## 3. Ready-to-Ship Gate Violations (0)
All components, services, and manual slices are verified!