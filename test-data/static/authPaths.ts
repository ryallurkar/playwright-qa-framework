// Shared path constants for storageState files.
// Kept outside tests/ so fixtures and setup can both import without
// triggering Playwright's "spec must not import setup file" constraint.
export const AUTH_FILE = '.auth/user.json';
