# Playwright QA

End-to-end, API, visual regression, and accessibility tests written with Playwright and TypeScript — demonstrating production-grade testing architecture across multiple layers of the stack.

---

## What's Inside

### UI / End-to-End

**[`tests/ui/login.spec.ts`](tests/ui/login.spec.ts)**
Full login flow coverage for SauceDemo: valid authentication, locked-account handling, empty-field validation, and session termination. Driven by static fixture data and a typed Page Object Model.

**[`tests/ui/playwright-best-practices.spec.ts`](tests/ui/playwright-best-practices.spec.ts)**
Demonstrates Playwright's resilient locator APIs — `getByRole`, `getByPlaceholder`, accessibility-first selectors — paired with web-first assertions and race-condition-safe interaction patterns. Covers login, product sorting, and cart state.

**[`tests/ui/network-interception.spec.ts`](tests/ui/network-interception.spec.ts)**
Three interception patterns in one suite: observing live request/response traffic, blocking individual assets with `route.abort()`, and mocking JSON API endpoints with `route.fulfill()`. Each test attaches structured JSON artifacts to the report.

**[`tests/ui/playwright-lifecycle-patterns.spec.ts`](tests/ui/playwright-lifecycle-patterns.spec.ts)**
Covers Playwright's full hook system — `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, nested `describe` blocks — with inline commentary on the tradeoffs of each. Also demonstrates `test.skip`, `test.only`, `test.fail`, and `test.fixme` with real-world rationale.

**[`tests/ui/login.visual.spec.ts`](tests/ui/login.visual.spec.ts)**
Seven visual regression scenarios: full-page baselines, component-level crops, masked sensitive fields, error state captures, and an intentional layout diff demo to exercise the regression detection workflow.

**[`tests/ui/accessibility.spec.ts`](tests/ui/accessibility.spec.ts)**
Automated WCAG scanning with axe-core via `@axe-core/playwright`, asserting zero critical violations on the login surface.

### API

**[`tests/api/posts.spec.ts`](tests/api/posts.spec.ts)**
Six REST tests covering the full CRUD surface against JSONPlaceholder: list shape validation, single-resource fetch, create (201), full replace (PUT), partial update (PATCH), and delete — each with typed response assertions and structured AAA steps. No secrets required; runs against a public endpoint.

### Architecture

**[`pages/`](pages/)** — Page Object Model with a `BasePage` foundation and typed concrete classes (`LoginPage`, `InventoryPage`)

**[`fixtures/`](fixtures/)** — Custom Playwright fixtures for pre-authenticated UI state (`loginPage`, `authenticatedPage`, `loggedInPage`) and a reusable typed API context

**[`helpers/`](helpers/)** — `APIClient` wrapper over Playwright's `APIRequestContext`; utilities for string generation, date formatting, JWT decoding, and async polling

**[`test-data/`](test-data/)** — Static user fixtures (JSON) and dynamic data generators for randomised test inputs

---

## Testing Approach

| Layer             | Tool                            | What's Covered                                          |
| ----------------- | ------------------------------- | ------------------------------------------------------- |
| E2E / UI          | Playwright                      | Login flows, navigation, product sorting, cart state    |
| API               | Playwright APIRequestContext    | CRUD operations, status codes, body shape               |
| Visual regression | Playwright snapshots            | Full-page, component, masked, error states              |
| Accessibility     | axe-core + @axe-core/playwright | WCAG violations on key surfaces                         |
| Network           | Playwright route interception   | Traffic observation, request blocking, response mocking |

Tests are tagged `@smoke` (critical path, runs on every PR/push) and `@regression` (full coverage, runs nightly). The CI pipeline keeps UI and API jobs separate so failures are isolated.

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

Copy `.env.example` to `.env` and set `BASE_URL` for UI tests. API tests default to `https://jsonplaceholder.typicode.com` and require no additional configuration.

| Variable             | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `BASE_URL`           | UI target (default: `https://www.saucedemo.com`)             |
| `API_BASE_URL`       | API target (default: `https://jsonplaceholder.typicode.com`) |
| `TEST_USER_EMAIL`    | Login email for authenticated flows                          |
| `TEST_USER_PASSWORD` | Login password for authenticated flows                       |

CI injects these from GitHub Secrets. The `API_BASE_URL` secret is optional.
