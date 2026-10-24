---
name: veriscribe
description: Orchestrates the VeriScribe Multi-Dimension AI QA & Living User Manual pipeline, including Phase 0 AST Ledger Scanning, Phase 1 Intent & Bug Triage, Phase 2 DOM/Behavior .spec.ts Upgrading, Phase 3 Playwright E2E + Annotated User Manual Generation, and Phase 4 Git-Diff Incremental Maintenance.
---

# VeriScribe — Multi-Dimension AI QA & Living User Manual Pipeline

Use this skill to bootstrap or incrementally maintain 100% functional and non-functional quality verification across an Angular frontend while automatically generating role- and locale-specific User Manuals as a by-product.

## Core Architecture Rules

1. **Never Cement Existing Bugs into Tests**: Before writing tests for unverified components/services, inspect the Angular template, TypeScript logic, and OpenAPI schema. If a branch, validator, or API call looks broken or ambiguous, record it in `qa-system/qa-manifest.json` under `ambiguitiesOrSuspectedBugs` with `"resolution": "OPEN"` and ask the user to resolve it before locking behavior into specs.
2. **Ban Shallow `toBeTruthy()` Stubs**: Every `.spec.ts` file MUST test real behavior:
   - For **Services**: Use `HttpTestingController` to verify HTTP methods, URLs, headers, request payloads, OpenAPI response shapes, and `4xx`/`5xx` error handling.
   - For **Components**: Render the real template, assert every `@if`/`*ngIf`/`@for`/`*ngFor` branch, `@Input()`/`@Output()` emission, Reactive Form validation state, role directive, and subscription cleanup (`takeUntilDestroyed` / `ngOnDestroy`).
3. **Every E2E Journey Produces a User Manual Chapter**: Every route slice in `featureSlices` must have a Playwright E2E spec using [`ManualJourneyRecorder`](../../qa-system/playwright/manual-recorder.ts) that verifies all 9 quality dimensions and emits `manual-steps.json` + annotated screenshots.

---

## Workflow 1: Initial Bootstrap (Feature-Slice Waves)

1. **Step 1 — Scan the Master Ledger**:
   ```bash
   node qa-system/scripts/scan-angular-ledger.mjs
   ```
   Review `qa-system/qa-manifest.json` and `qa-system/reports/coverage-audit.md`.
2. **Step 2 — Triage Ambiguities & OpenAPI Contracts**:
   - Compare `services[*].httpEndpoints` against `openapi.json`.
   - Inspect components for missing error states, unsubscribed `.subscribe()` calls, or dead template branches.
   - Present any `OPEN` ambiguities to the user for quick confirmation.
3. **Step 3 — Wave Execution via Parallel Subagents**:
   - **Wave A (Core Services)**: Upgrade all `MISSING` or `SHALLOW_STUB` `*.service.spec.ts` files first and mark them `"VERIFIED"` in `qa-manifest.json`.
   - **Wave B (Vertical Feature Slices)**: For each route slice in `featureSlices`:
     1. Upgrade all child component `.spec.ts` files across all 6 component dimensions.
     2. Create/update deterministic mock fixtures validated against `openapi.json`.
     3. Create/update the Playwright E2E journey using `ManualJourneyRecorder` covering:
        - Happy path steps with visual callout screenshots (`manual.recordStep(...)`)
        - Degraded/error states (`4xx`/`5xx`, empty states -> `manual.recordTroubleshootingScenario(...)`)
        - RBAC role access matrix (`admin`, `user`, `guest`)
        - Responsive viewports (`desktop`, `tablet`, `mobile` via `manual.verifyResponsiveViewports()`)
        - Accessibility (`@axe-core/playwright` zero violations)
        - i18n untranslated key check (`manual.assertNoUntranslatedI18nKeys()`)
     4. Run `node qa-system/scripts/export-manual.mjs` to compile the User Manual (`docs/manuals/<locale>/<role>/USER_MANUAL.md`).
     5. Mark the slice `"DOCUMENTED"` in `qa-manifest.json`.

---

## Workflow 2: Continuous Incremental Maintenance (On Every Code Change / PR)

1. **Step 1 — Run Incremental Impact Analysis**:
   ```bash
   node qa-system/scripts/scan-angular-ledger.mjs
   node qa-system/scripts/incremental-impact.mjs
   ```
2. **Step 2 — Inspect Delta**:
   Read `qa-system/reports/impact-plan.md` to see the exact list of impacted services, components, Playwright journeys, and User Manual chapters.
3. **Step 3 — Targeted AI Healing & Manual Refresh**:
   - Update only the impacted `.spec.ts` and Playwright `.e2e.spec.ts` files.
   - Re-run only the impacted unit and Playwright tests (which automatically re-captures fresh annotated screenshots for modified UI steps).
   - Run `node qa-system/scripts/export-manual.mjs` to update the Markdown/PDF/DOCX/Confluence user manuals.
   - Update `lastVerifiedCommit` in `qa-manifest.json` and verify `node qa-system/scripts/incremental-impact.mjs --ci-gate` exits with `0`.
