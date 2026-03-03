# Playwright QA Framework

A production-ready Playwright + TypeScript automation framework for UI and API testing with reusable page objects, typed fixtures, Allure reporting, and GitHub Actions CI.

## Tech Stack

- Playwright Test
- TypeScript
- ESLint
- Prettier
- dotenv
- Allure Reporter

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A target application URL and API URL

## Installation

```bash
npm install
npx playwright install
cp .env.example .env
```

Update `.env` with valid application and API values before running tests.

## Running Tests Locally

Run all UI tests across Chromium, Firefox, and WebKit:

```bash
npm run test:ui
```

Run all API tests:

```bash
npm run test:api
```

Run the full suite:

```bash
npx playwright test
```

Run a single spec:

```bash
npx playwright test tests/ui/login.spec.ts --project=chromium
```

## Running Specific Tags

Smoke coverage:

```bash
npm run test:smoke
```

Regression coverage:

```bash
npm run test:regression
```

You can also filter directly:

```bash
npx playwright test --grep "@ui"
npx playwright test --grep "@api"
```

## Test Scenarios

The current UI login coverage targets `https://www.saucedemo.com`.

- `@smoke @ui` `should login successfully with valid credentials`
- `@regression @ui` `should show error for locked out user`
- `@regression @ui` `should show error for invalid credentials`
- `@regression @ui` `should show error when username is empty`
- `@regression @ui` `should show error when password is empty`
- `@smoke @ui` `should logout successfully after login`

Run just the Saucedemo login suite:

```bash
npx playwright test tests/ui/login.spec.ts
```

Run only smoke tests:

```bash
npx playwright test --grep @smoke
```

## Allure Report

Generate and open the Allure report:

```bash
npm run report
```

Raw Allure results are written to `allure-results/`. The generated HTML report is written to `allure-report/`.

## Folder Structure

```text
.
├── .github/workflows/ci.yml
├── fixtures/customFixtures.ts
├── helpers/
│   ├── apiClient.ts
│   └── utils.ts
├── pages/
│   ├── BasePage.ts
│   ├── InventoryPage.ts
│   └── LoginPage.ts
├── test-data/
│   ├── dynamic/randomData.ts
│   └── static/users.json
├── tests/
│   ├── api/
│   │   ├── auth.spec.ts
│   │   └── users.spec.ts
│   └── ui/
│       └── login.spec.ts
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

## Adding a New Page Object

1. Create a new class in `pages/` that extends `BasePage`.
2. Add strongly typed selectors as class properties.
3. Encapsulate page interactions in reusable async methods.
4. Expose the page object through `fixtures/customFixtures.ts` if tests need it.

## Adding a New Test

1. Add a new spec under `tests/ui` or `tests/api`.
2. Import `test` and `expect` from `@fixtures/customFixtures`.
3. Tag each test title with at least one functional tag such as `@smoke`, `@regression`, `@ui`, or `@api`.
4. Follow the Arrange, Act, Assert structure to keep tests isolated and readable.

## CI/CD

GitHub Actions runs on pushes and pull requests to `main`.

- Pull requests run the smoke suite to validate critical flows quickly.
- Pushes to `main` run the full regression suite.
- Dependencies are cached for faster execution.
- Playwright browsers are installed during the workflow.
- Allure results and the generated HTML report are uploaded as artifacts.

## Environment Variables

The framework reads values from `.env`.

- `BASE_URL`: UI application base URL used by page objects and UI projects
- `API_BASE_URL`: API base URL used by API fixtures and API client
- `TEST_USER_EMAIL`: Valid login email for authenticated test flows
- `TEST_USER_PASSWORD`: Valid login password for authenticated test flows
- `CI`: Controls CI-specific behavior such as retries
