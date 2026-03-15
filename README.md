# Playwright QA Engineering Showcase

[![Nightly Regression](https://github.com/ryallurkar/playwright-qa-framework/actions/workflows/ci.yml/badge.svg?event=schedule)](https://github.com/ryallurkar/playwright-qa-framework/actions/workflows/ci.yml)

End-to-end, API, visual regression, and accessibility tests written with Playwright and TypeScript — demonstrating production-grade testing architecture across multiple layers of the stack.

---

## What's Inside

### UI / End-to-End

| Spec | What it demonstrates |
|---|---|
| [`tests/ui/login.spec.ts`](tests/ui/login.spec.ts) | Full login flow: valid auth, locked account, empty-field validation, session termination. Driven by static fixture data and a typed Page Object Model. |
| [`tests/ui/playwright-best-practices.spec.ts`](tests/ui/playwright-best-practices.spec.ts) | Resilient locator APIs (`getByRole`, `getByPlaceholder`), web-first assertions, race-condition-safe interactions. Covers login, product sorting, and cart state. |
| [`tests/ui/network-interception.spec.ts`](tests/ui/network-interception.spec.ts) | Three interception patterns: observing live traffic, blocking assets with `route.abort()`, mocking JSON endpoints with `route.fulfill()`. Each test attaches structured JSON artifacts to the report. |
| [`tests/ui/playwright-lifecycle-patterns.spec.ts`](tests/ui/playwright-lifecycle-patterns.spec.ts) | Full hook system (`beforeAll`, `afterAll`, `beforeEach`, `afterEach`), nested `describe` blocks, and all four test modifiers — `test.skip`, `test.only`, `test.fail`, `test.fixme` — with real-world rationale for each. |
| [`tests/ui/login.visual.spec.ts`](tests/ui/login.visual.spec.ts) | Seven visual regression scenarios: full-page baselines, component-level crops, masked sensitive fields, error state captures, and an intentional layout diff to exercise the regression detection workflow. |
| [`tests/ui/accessibility.spec.ts`](tests/ui/accessibility.spec.ts) | WCAG scanning with axe-core via `@axe-core/playwright`. Violations are logged to the report rather than hard-failing, surfacing issues on third-party surfaces without blocking the suite. |
| [`tests/ui/soft-assertions.spec.ts`](tests/ui/soft-assertions.spec.ts) | `expect.soft()` pattern: collects all assertion failures before ending the test instead of stopping at the first one. Paired with the `preAuthPage` fixture, which restores a saved session via `storageState` rather than logging in per test. |

### API

| Spec | What it demonstrates |
|---|---|
| [`tests/api/posts.spec.ts`](tests/api/posts.spec.ts) | Full CRUD surface against [JSONPlaceholder](https://jsonplaceholder.typicode.com): list shape validation, single-resource fetch, create (201), full replace (PUT), partial update (PATCH), and delete. Typed response assertions, structured AAA steps. No secrets required. |

### Architecture

| Layer | Location | Purpose |
|---|---|---|
| Page Objects | [`pages/`](pages/) | `BasePage` foundation with typed concrete classes (`LoginPage`, `InventoryPage`) |
| Fixtures | [`fixtures/`](fixtures/) | Pre-authenticated UI state, `storageState`-backed session fixture, typed API context |
| Helpers | [`helpers/`](helpers/) | `APIClient` wrapper over `APIRequestContext`; string, date, JWT, and polling utilities |
| Test data | [`test-data/`](test-data/) | Static user fixtures (JSON) and dynamic data generators for randomised inputs |

---

## CI / CD

Two separate GitHub Actions jobs keep UI and API failures isolated.

| Trigger | Job | What runs |
|---|---|---|
| PR to `main` | `ui-tests` | `@smoke` tests — Chromium + Firefox |
| Push to `main` | `ui-tests` | `@smoke` tests — Chromium + Firefox |
| Nightly (2 AM UTC) | `ui-tests` | Full `@regression` suite — Chromium + Firefox |
| Nightly (2 AM UTC) | `api-tests` | Full API suite against JSONPlaceholder |

Artifacts uploaded on every run: `playwright-report`, `allure-results`, `allure-report`.

→ [View workflow runs](https://github.com/ryallurkar/playwright-qa-framework/actions/workflows/ci.yml)

---

## Testing Approach

| Layer | Tool | What's Covered |
|---|---|---|
| E2E / UI | Playwright | Login flows, navigation, sorting, cart state, soft assertions |
| API | Playwright `APIRequestContext` | CRUD operations, status codes, body shape |
| Visual regression | Playwright snapshots | Full-page, component, masked, error states |
| Accessibility | axe-core + `@axe-core/playwright` | WCAG violations on key surfaces |
| Network | Playwright route interception | Traffic observation, request blocking, response mocking |

Tests are tagged `@smoke` (critical path, runs on every PR and push) and `@regression` (full coverage, runs nightly). A global setup step saves an authenticated session to `.auth/user.json` once per run; tests that need authenticated state restore it via `storageState` rather than logging in individually.

---

## Tech Stack

- **[Playwright](https://playwright.dev)** — test runner, browser automation, API client, network layer
- **TypeScript** — strict mode throughout; path aliases; typed fixtures and helpers
- **Allure** — rich HTML reporting with step-level detail, JSON attachments, and run history
- **axe-core** — automated accessibility scanning integrated into the test run
- **GitHub Actions** — parallel CI with dependency caching, scheduled nightly runs, and artifact uploads
- **ESLint + Prettier** — enforced code style across the entire test suite

---

## Running Tests

```bash
npm install
npx playwright install
cp .env.example .env
```

```bash
npm run test:ui          # UI tests — Chromium, Firefox
npm run test:api         # API tests
npm run test:smoke       # Critical path only
npm run test:regression  # Full nightly suite
npm run report           # Generate and open Allure report
```

Filter by tag or run a single spec:

```bash
npx playwright test --grep "@visual"
npx playwright test tests/ui/network-interception.spec.ts
npx playwright test --debug
```

---

## Environment

Copy `.env.example` to `.env`. API tests require no additional configuration.

| Variable | Purpose |
|---|---|
| `BASE_URL` | UI target (default: `https://www.saucedemo.com`) |
| `API_BASE_URL` | API target (default: `https://jsonplaceholder.typicode.com`) |
| `TEST_USER_EMAIL` | Login email for authenticated flows |
| `TEST_USER_PASSWORD` | Login password for authenticated flows |

CI injects these from GitHub Secrets. `API_BASE_URL` is optional.
